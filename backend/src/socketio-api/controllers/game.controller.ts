import { SocketHandler, SocketMiddleware, NamespaceMiddlewareError, ISocketIoNamespace, AuthorizedSocket, NamespaceClientsCallback } from '../@types';
import GameInitializer, { IGameDocument, IGameModel } from '../../models/game.model';
import { ServiceError } from '../../services/common.service';
import { IBoardDocument } from '../../models/board.model';
import { IUserDocument } from '../../models/user.model';
import { stopSuspendedRemoving, changeRemovingCondition, RemoveEventHandler, hasRemovingCondition, findGame } from '../../services/game.service';
import SessionInitializer, { ISessionDocument, ISessionModel } from '../../models/session.model';
import { ObjectID, ObjectId } from 'bson';
import { ISocketIOHelpersService, getService } from '../services/helpers.service';
import { promisify } from 'util';
import { GameLoopController } from './gameLoop.class';

let Game: IGameModel;
let Session: ISessionModel;

const namespaceName: string = '/games';
let helpersService: ISocketIOHelpersService;
let server: SocketIO.Server;
let namespaceInfo: ISocketIoNamespace;
let namespace: SocketIO.Namespace;

// const currentClients: {[userId: string]: AuthorizedSocket} = {}; // FIXME: may be needed for better performance

export function initialize(socketIoServer: SocketIO.Server): ISocketIoNamespace {
  if (server && server !== socketIoServer) {
    throw new TypeError('Server is already initialized! Recheck or comment this line');
  }
  server = socketIoServer;
  namespace = server.of(namespaceName);
  helpersService = getService();

  Session = SessionInitializer.getModel();
  Game = GameInitializer.getModel();

  namespaceInfo = {
    connectionHandler,
    middlewares: [
      helpersService.checkAuthAndAccessMiddleware
    ],
    name: namespaceName
  }
  return namespaceInfo;
}

export const connectionHandler: SocketHandler = async socket => {
  try {
    await joinGame(socket);
    socket.on('disconnect', async () => {
      try {
        await disconnectPlayerFromGame(
          await findGame(socket.data.gameId),
          await Session.findById(socket.data.sessionId)
        );
      } catch (err) {
        // TODO: log error
      }
    });
  } catch (err) {
    socket.emit('disconnect-message', err);
    socket.disconnect(true);
  }
}

export async function joinGame(socket: AuthorizedSocket) {
  const game = await findGame(socket.data.gameId);
  const session = await Session.findById(socket.data.sessionId);
  if (game.state !== 'open') {
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
  if (await tryStartGame(game)) {
    stopSuspendedRemoving(game.id);
  } else if (!hasRemovingCondition(game.id)) {
    changeRemovingCondition(game.id, suspendedRemovingCondition);
  }
  await game.save();
  await session.save();
  socket.join(socket.data.gameId);
}

async function tryStartGame(game: IGameDocument): Promise<boolean> {
  if (!game.populated('board')) {
    await game.populate('board').execPopulate();
  }
  if (game.players.length === (game.board as IBoardDocument).rules.playerLimits.max) {
    game.state = 'playing';

    // TODO: start game
    startGame(game).then(() => {
      // TODO: add logging
    }).catch(err => {
      // TODO: add logging      
    });
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
  if (await tryStartGame(game)) {
    return false;
  } else {
    if (game.players.length) {
      const withRoomNsp = namespace.to(game.id);
      const clients = await (promisify(withRoomNsp.clients.bind(withRoomNsp))());
      for (let client of clients) {
        namespace.connected[client].emit("disconnect-message", new Error("The room is being closed"));
        namespace.connected[client].disconnect(true);
      }
      // namespace.to(game.id).clients
      // (((err, clients) => {
      //   for (let client of clients) {
      //     namespace.connected[client].disconnect(true);
      //   }
      // }) as NamespaceClientsCallback);
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

async function disconnectPlayerFromGame(game: IGameDocument, session: ISessionDocument) {
  // TODO: probably additional check game.id == session.id is needed
  const playerIndex = game.players.findIndex(player => {
    const playerSessionId: string = player.session instanceof ObjectID
      ? player.session.toHexString()
      : player.session.id;
    return playerSessionId === session.id;
  });
  // if (playerIndex < 0) {
  //   throw new Error('This session is not attached to this game');
  // }
  game.players.splice(playerIndex, 1);
  await game.save();
  session.game = null;
  await session.save();
  // TODO: define user if 1 player left
  // TODO: add reconnect timeout and freeze game until time is up
}

async function startGame(game: IGameDocument) {
  if (!game.populated('board')) {
    await game.populate('board');
  }
  const controller = await GameLoopController.getInstance((game.board as IBoardDocument).id);
  return await controller.initiateGame(game);
}