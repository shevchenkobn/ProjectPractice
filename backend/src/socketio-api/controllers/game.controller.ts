import { SocketHandler, SocketMiddleware, NamespaceMiddlewareError, ISocketIoNamespace, AuthorizedSocket, NamespaceClientsCallback } from '../@types';
import GameInitializer, { IGameDocument, IGameModel } from '../../models/game.model';
import { ServiceError } from '../../services/common.service';
import { IBoardDocument } from '../../models/board.model';
import { IUserDocument } from '../../models/user.model';
import { stopSuspendedRemoving, changeRemovingCondition, RemoveEventHandler, hasRemovingCondition, findGame, IGamesConfig, suspendRemoving, gamesConfig } from '../../services/game.service';
import SessionInitializer, { ISessionDocument, ISessionModel } from '../../models/session.model';
import { ObjectID, ObjectId } from 'bson';
import { getClientIds, disconnectSocket, checkAuthAndAccessMiddleware } from '../services/helpers.service';
import { GameLoopController } from './gameLoop.class';
import { getId } from '../../services/helpers.service';

let Game: IGameModel;
let Session: ISessionModel;

const namespaceName: string = '/games';
let server: SocketIO.Server;
let namespaceInfo: ISocketIoNamespace;
let namespace: SocketIO.Namespace;

// const currentClients: {[userId: string]: AuthorizedSocket} = {}; // FIXME: may be needed for better performance

export function initialize(socketIoServer: SocketIO.Server): ISocketIoNamespace {
  if (server && server !== socketIoServer) {
    throw new TypeError('Server is already initialized!');
  }
  server = socketIoServer;
  namespace = server.of(namespaceName);

  Session = SessionInitializer.getModel();
  Game = GameInitializer.getModel();

  namespaceInfo = {
    connectionHandler,
    middlewares: [
      checkAuthAndAccessMiddleware
    ],
    name: namespaceName
  }
  return namespaceInfo;
}

export const connectionHandler: SocketHandler = async socket => {
  try {
    await joinGame(socket);
    socket.on('disconnect', disconnectHandler.bind(this, socket));
  } catch (err) {
    // TODO: log error
    disconnectSocket(socket, err);
    try {
      namespace.to(socket.data.gameId).emit('player-left', {
        id: ((await Session.findById(socket.data.sessionId)).user as ObjectId).toHexString()
      });
    } catch (err) {
      // TODO: log error
    }
  }
}

export async function joinGame(socket: AuthorizedSocket) {
  const game = await findGame(socket.data.gameId);
  const session = await Session.findById(socket.data.sessionId);
  if (game.status !== 'open') {
    throw new ServiceError('The game room is not open');
  }
  await game.populate('board').execPopulate();
  if (game.players.length === (game.board as IBoardDocument).rules.playerLimits.max) {
    throw new ServiceError('The game room is full');
  } else if (session.game) {
    throw new ServiceError('The user has already joined some game under this session');
  }
  game.players.push(<any>{
    session: session,
    user: session.user,
    status: 'active'
  });
  session.game = game.id;
  if (!(await trySetCoundownForGame(game) || hasRemovingCondition(game.id))) {
    changeRemovingCondition(game.id, suspendedRemovingCondition);
  }
  await game.save();
  await session.save();
  namespace.to(socket.data.gameId).emit('player-joined', {
    id: (session.user as ObjectId).toHexString()
  });
  socket.join(socket.data.gameId);
}

async function trySetCoundownForGame(game: IGameDocument, mustBeFull = true): Promise<boolean> {
  if (!game.populated('board')) {
    await game.populate('board').execPopulate();
  }
  if (
    mustBeFull && game.players.length === (game.board as IBoardDocument).rules.playerLimits.max
    || game.players.length >= (game.board as IBoardDocument).rules.playerLimits.min
  ) {
    game.status = 'playing';
    await game.save();
    
    if (hasRemovingCondition(game.id)) {
      stopSuspendedRemoving(game.id);
    }

    for (let clientId of await getClientIds(namespace, game.id)) {
      namespace.connected[clientId].once('ready', readyHandler);
    }

    suspendRemoving(game.id, gamesConfig.startCountdown);
    changeRemovingCondition(game.id, countdownRemovingCondition);

    return true;
  } else {
    return false;
  }
}

export function disconnectUser(session: ISessionDocument) {
  // if (!session.game) {
  //   return;
  // }
  return new Promise((resolve, reject) => {
    namespace.to(
      session.populated('game')
        ? (session.game as IGameDocument).id
        : (session.game as ObjectId).toHexString()
    ).clients((async (err, clients) => {
      if (err) {
        reject(err);
      }
      const socketId = clients.find(socketId => {
        return (namespace.connected[socketId] as AuthorizedSocket).data.sessionId === session.id;
      });
      if (socketId) {
        namespace.connected[socketId].disconnect(true);
        // if (!session.populated('game')) {
        //   await session.populate('game').execPopulate();
        // }
        // await disconnectPlayerFromGame(session.game as IGameDocument, session);
      }
      resolve();
    }) as NamespaceClientsCallback);
  });
}

const suspendedRemovingCondition: RemoveEventHandler = async (game) => {
  if (await trySetCoundownForGame(game, false)) {
    return false;
  } else {
    if (game.players.length) {
      const clients = await getClientIds(namespace, game.id);
      for (let client of clients) {
        disconnectSocket(namespace.connected[client], new Error("The room is being closed"));
      }
      const promises = [];
      await game.extendedPopulate(['players.sessions']);
      for (let i = 0; i < game.players.length; i++) {
        const session = game.players[i].session as ISessionDocument;
        session.game = null;
        promises.push(session.save());
      }
      await Promise.all(promises);
    }

    return true;
  }
}

const countdownRemovingCondition: RemoveEventHandler = async (game) => {
  if (game.populated('board')) {
    await game.populate('board');
  }
  if (
    game.players.reduce((sum, player) => {
      if (player.status !== 'gone') {
        sum++;
      }
      return sum;
    }, 0) >= (game.board as IBoardDocument).rules.playerLimits.min
  ) {
    for (let player of game.players) {
      if (player.status === 'waiting') {
        player.status = 'active';
      }
    }
    await game.save();
    startGame(game).then(() => {
      // TODO: add logging
    }).catch(err => {
      // TODO: add logging      
    });
    return false;
  } else {
    return true;
  }
}

async function disconnectPlayerFromGame(game: IGameDocument, session: ISessionDocument) {
  // FIXME: probably additional check game.id == session.id is needed
  const playerIndex = game.players.findIndex(player => {
    const playerSessionId: string = getId(player.session);
    return playerSessionId === session.id;
  });
  // if (playerIndex < 0) {
  //   throw new Error('This session is not attached to this game');
  // }
  if (game.status === 'open') {
    game.players.splice(playerIndex, 1);
  } else {
    game.players[playerIndex].status = 'gone';
    game.players[playerIndex].whenGone = new Date();
  }
  await game.save();
  session.game = null;
  await session.save();

  namespace.to(game.id).emit('player-left', {
    id: session.populated('user') ? (session.user as IUserDocument).id : (session.user as ObjectId).toHexString()
  });

  if (game.status === 'playing') {
    (await GameLoopController.getInstance(
      game.populated('board') ? (game.board as IBoardDocument).id : (game.board as ObjectId).toHexString()
    )).tryWinGame(game);
  }
  // TODO: add reconnect timeout and freeze game until time is up
}

async function startGame(game: IGameDocument) {
  if (!game.populated('board')) {
    await game.populate('board');
  }
  const controller = await GameLoopController.getInstance((game.board as IBoardDocument).id);
  return await controller.initiateGame(game);
}

async function disconnectHandler(socket: AuthorizedSocket) {
  try {
    await disconnectPlayerFromGame(
      await findGame(socket.data.gameId),
      await Session.findById(socket.data.sessionId)
    );
  } catch (err) {
    // TODO: log error
  }
}

async function readyHandler(socket: AuthorizedSocket) {
  try {
    const game = await findGame(socket.data.gameId);
    game.players.find(player => (player.session as ObjectId).toHexString() === socket.data.sessionId).status = 'active';
    await game.save();
    const nonGonePlayers = game.players.filter(player => player.status !== 'gone');
    if (
      nonGonePlayers.length === nonGonePlayers.reduce((count, player) => {
        if (player.status === 'active') {
          count++;
        }
        return count;
      }, 0)
    ) {
      stopSuspendedRemoving(game.id);
      // FIXME: uncomment if once is not working
      // for (let socketId of await getClientIds(namespace, game.id)) {
      //   namespace.connected[socketId].removeAllListeners('ready');
      // }
      startGame(game).then(() => {
        // TODO: add logging
      }).catch(err => {
        // TODO: add logging      
      });
    }
  } catch (err) {
    // TODO: log error
  }
}