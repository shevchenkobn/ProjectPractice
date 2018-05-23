import { ISocketIOConfig, SocketMiddleware } from './@types';
import { getService, ISocketIOHelpersService, ISocketIOUrls } from './services/helpers.service';
import config from 'config';
import { connectionHandler } from './controllers/connection.handler';

let helpersService: ISocketIOHelpersService;
let socketConfig: ISocketIOConfig;
const upgradeUrl = config.get<ISocketIOUrls>('socketIO').baseUrl;

export function getConfig(): ISocketIOConfig {
  if (socketConfig) {
    return socketConfig;
  }

  helpersService = getService();
  const gameMiddlewares: Array<SocketMiddleware> = [
    helpersService.checkAuthAndAccessMiddleware 
  ];
  socketConfig = {
    namespaces: {
      '/games': {
        connectionHandler,
        middlewares: gameMiddlewares,
      }
    },
    serverOptions: {
      serveClient: true,
      path: upgradeUrl
    }
  };
  return socketConfig;
}