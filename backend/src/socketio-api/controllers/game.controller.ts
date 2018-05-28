import { SocketHandler, SocketMiddleware, NamespaceMiddlewareError, ISocketIoNamespace, AuthorizedSocket } from '../@types';
import { IGameDocument } from '../../models/game.model';
import { ServiceError } from '../../services/common.service';
import { IBoardDocument } from '../../models/board.model';
import { IUserDocument } from '../../models/user.model';
import { stopSuspendedRemoving, changeRemovingCondition, RemoveEventHandler } from '../../services/game.service';
import { ISessionDocument } from '../../models/session.model';
import { ObjectID } from 'bson';
import { ISocketIOHelpersService, getService } from '../services/helpers.service';

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
    await joinGame(socket.data.game, socket.data.session as ISessionDocument);
    // FIXME: use redis for better performance and cluster node
    // const userId = socket.data.session.user instanceof ObjectID
    //   ? socket.data.session.user.toHexString()
    //   : (socket.data.session.user as IUserDocument).id;
    // currentClients[userId] = socket;
  } catch (err) {
    if (err instanceof ServiceError) {
      throw new NamespaceMiddlewareError(err.message);
    } else {
      throw err;
    }
  }
}

export async function joinGame(game: IGameDocument, session: ISessionDocument) {
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
  } else {
    changeRemovingCondition(game.id, suspendedRemovingCondition);
  }
  await game.save();
  await session.save();
}

async function tryStartGame(game: IGameDocument): Promise<boolean> {
  if (!game.populated('board')) {
    await game.populate('board').execPopulate();
  }
  if (game.players.length === (game.board as IBoardDocument).rules.playerLimits.max) {
    game.state = 'playing';

    return true;
    // TODO: start game
  } else {
    return false;
  }
}

export async function disconnectUser(userId: string) {
  const socket = Object.keys(namespace.connected).find(socketId => {
    const socketSessionUser = (namespace.connected[socketId] as AuthorizedSocket).data.session.user;
    const socketUserId = socketSessionUser instanceof ObjectID
      ? socketSessionUser.toHexString()
      : socketSessionUser.id;
    return socketUserId === userId;
  });
  if (socket) {
    namespace.connected[socket].disconnect(true);
  }
}

const suspendedRemovingCondition: RemoveEventHandler = async (game) => {
  if (!await tryStartGame(game)) {
    return false;
  } else {
    const promises = [];
    if (game.players.length) {
      for (let i = 0; i < game.players.length; i++) {
        if (game.players[i].session instanceof ObjectID) {
          await game.populate('players.' + i + '.user').execPopulate();
        }
        const session = game.players[i].session as ISessionDocument;
        session.game = null;
        promises.push(session.save());
      }
      // FIXME: try this if fails to(room).clients() loop
      namespace.to(game.id).emit('disconnect');
      await Promise.all(promises);
    }

    return true;
  }
}