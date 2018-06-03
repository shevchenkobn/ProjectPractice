import { SocketMiddleware, ISocketIoNamespace } from './@types';
import { initialize as helperServiceInitialize, ISocketIOUrls } from './services/helpers.service';
import config from 'config';
import { connectionHandler, initialize as gameControllerInitializer } from './controllers/game.controller';

let socketIoNamespaces: Array<ISocketIoNamespace>;
const upgradeUrl = config.get<ISocketIOUrls>('socketIO').baseUrl;

export function initialize(server: SocketIO.Server): Array<ISocketIoNamespace> {
  if (socketIoNamespaces) {
    return socketIoNamespaces;
  }
  if (!server) {
    throw new Error('Server must be provided');
  }
  
  helperServiceInitialize();

  socketIoNamespaces = [
    gameControllerInitializer(server)
  ];

  return socketIoNamespaces;
}

export function getSocketIoServerOptions(): SocketIO.ServerOptions {
  return {
    serveClient: true,
    path: upgradeUrl
  };
};