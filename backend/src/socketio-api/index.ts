import { ISocketIOConfig, SocketMiddleware } from './@types';
import { getService, ISocketIOHelpersService, ISocketIOUrls } from './services/helpers.service';
import config from 'config';

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
        middlewares: gameMiddlewares,
        connectionHandler: (socket) => {
          console.log('connected: ', socket);          
        }
      }
    },
    serverOptions: {
      serveClient: true,
      path: upgradeUrl
    }
  };
  return socketConfig;
}