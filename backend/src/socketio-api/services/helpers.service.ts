
import { URL } from 'url';
import { SocketMiddleware, AllowRequestHandler, NspMiddlewareError } from './../@types';
import { getService as getAuthService, IAuthenticationService, ClientAuthError } from '../../services/authentication.service';
import config from 'config';
import { IncomingMessage } from 'http';
import { NotFound } from 'http-errors';
import { ClientRequestError } from '../../services/error-handler.service';
import { findGame } from '../../services/game.service';
import { rethrowError } from '../../services/common.service';

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
        let session = authService.getState(req);
        if (!session) {
          const token = authService.getToken(req);
          session = await authService.getSessionFromToken(token);
          if (!session) {
            return next(new NspMiddlewareError("Invalid Token"));
          }
        }
        const gameId = getGameId(req.url);
        let game;
        try {
          game = await findGame(gameId);
        } catch (err) {
          rethrowError(err);
        }
        if (!game) {
          return next(new NspMiddlewareError("Invalid game id"));
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
// const gameIdRegex = /^[a-f\d]{24}$/i;
function getGameId(url: string): string {
  if (!url.startsWith(baseUrl)) {
    return null;
  }
  const gameId = url.split('?')[0].replace(baseUrl, '').replace('\/', '');
  return gameId;//gameIdRegex.test(gameId) ? gameId : null;
}