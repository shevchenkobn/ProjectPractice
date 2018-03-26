import { ISocketIOConfig } from './@types';
import { getService, ISocketIOHelpersService } from './services/helpers.service';
import config from 'config';

let helpersService: ISocketIOHelpersService;
let socketConfig: ISocketIOConfig;
let upgradeUrl = config.get<string>('socketSwitchUrl');
if (upgradeUrl[upgradeUrl.length - 1] === '/') {
  upgradeUrl = upgradeUrl.slice(0, -1);
}

export function getConfig(): ISocketIOConfig {
  if (socketConfig) {
    return socketConfig;
  }

  helpersService = getService();
  const middlewares = [
    helpersService.checkAuthAndAccessMiddleware 
  ];
  socketConfig = {
    middlewares,
    connectionHandler: (socket) => {
      console.log('connected: ', socket);
    },
    serverOptions: {
      // serveClient: true,
      path: upgradeUrl
    }
  };
  return socketConfig;
}