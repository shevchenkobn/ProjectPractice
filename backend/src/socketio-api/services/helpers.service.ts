
import { URL } from 'url';
import { SocketMiddleware, AllowRequestHandler } from './../@types';
import { getService as getAuthService, IAuthenticationService, ClientAuthError } from '../../services/authentication.service';
import config from 'config';
import { IncomingMessage } from 'http';
import { NotFound } from 'http-errors';
import { ClientRequestError } from '../../services/error-handler.service';

export interface ISocketIOHelpersService {
  checkAuthAndAccessMiddleware: SocketMiddleware;
}

export interface ISocketIOUrls {
  baseUrl: string,
  apiSwitch: string
}

let authService: IAuthenticationService;
let service: ISocketIOHelpersService;

export function getService() {
  if (service) {
    return service;
  }
  authService = getAuthService();
  service = {
    checkAuthAndAccessMiddleware: async (socket, next) => {
      try {
        const req = socket.request;
        let state = authService.getState(req);
        if (!state) {
          const token = authService.getToken(req);
          state = await authService.getAuthStateFromToken(token);
          if (!state) {
            return next(new ClientAuthError("Invalid Token"));
          }
        }
        const gameId = getGameId(req.url);
        if (!gameId) {
          return next(new ClientRequestError("Invalid game id"));
        }

        // get the game and do something else
        next();
      } catch (err) {
        next(err);
      }
    }
  };
  return service;
}

let urls = config.get<ISocketIOUrls>('socketIO');
const baseUrl = `/${urls.baseUrl}/${urls.apiSwitch}/`.replace(/\/\//g, '/');
const gameIdRegex = /^[a-f\d]{24}$/i;
function getGameId(url: string): string {
  if (!url.startsWith(baseUrl)) {
    return null;
  }
  const gameId = url.split('?')[0].replace(baseUrl, '').replace(/\//, '');
  return gameIdRegex.test(gameId) ? gameId : null;
}