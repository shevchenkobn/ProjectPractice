
import { URL } from 'url';
import { SocketMiddleware, AllowRequestHandler } from './../@types';
import { getService as getAuthService, IAuthenticationService, ClientAuthError } from '../../services/authentication.service';
import config from 'config';
import { IncomingMessage } from 'http';
import { NotFound } from 'http-errors';

export interface ISocketIOHelpersService {
  checkAuthAndAccessMiddleware: SocketMiddleware;
}

let authService: IAuthenticationService;
let service: ISocketIOHelpersService;

const gameIdRegex = /^[a-f\d]{24}$/i;
function isUrlCorrect(url: string) {
  url = url.split('?')[0];
  const parts = url.split('/');
  url = parts[parts.length - 1] || parts[parts.length - 2];
  return gameIdRegex.test(url);
}

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
        if (!isUrlCorrect(req.url)) {
          return next(new NotFound());
        }

        // do something else
        next();
      } catch (err) {
        next(err);
      }
    }
  };
  return service;
}