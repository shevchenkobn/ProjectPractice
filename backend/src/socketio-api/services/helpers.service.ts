
import { URL } from 'url';
import { SocketMiddleware, AllowRequestHandler, NamespaceMiddlewareError, AuthorizedSocket } from './../@types';
import { getService as getAuthService, IAuthenticationService, ClientAuthError } from '../../services/authentication.service';
import config from 'config';
import { IncomingMessage } from 'http';
import { NotFound } from 'http-errors';
import { ClientRequestError } from '../../services/error-handler.service';
import { findGame } from '../../services/game.service';
import { rethrowError, ServiceError } from '../../services/common.service';
import { IUserDocument } from '../../models/user.model';
import { ISessionDocument } from '../../models/session.model';
import shuffleArray from 'shuffle-array';
import { promisify } from 'util';

export interface ISocketIOHelpersService {
  checkAuthAndAccessMiddleware: SocketMiddleware;
  getRange(size: number, shuffle?: boolean): Array<number>;
  getIntegerBetween(min: number, max: number): number;
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
            return next(new NamespaceMiddlewareError("Invalid Token"));
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
          return next(new NamespaceMiddlewareError("Invalid game id"));
        }

        (socket as AuthorizedSocket).data = {
          sessionId: session.id,
          gameId: gameId
        };

        next();
      } catch (err) {
        next(err);
      }
    },

    getRange(size, shuffle = false) {
      const arr = Array.apply(null, { length: size })
        .map(Number.call, Number) // range [0 ... length]
      if (shuffle) {
        shuffleArray(arr);
      }
      return arr;
    },

    getIntegerBetween(min, max) {
      min = Math.round(min), max = Math.round(max + 1);
      return Math.round(min + Math.random() * (max - min));
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

export function disconnectSocket(socket: SocketIO.Socket, message: any, close: boolean = true) {
  socket.emit('disconnect-message', message);
  socket.disconnect(close);
}

export function getClientIds(nsp: SocketIO.Namespace, room: string): Promise<Array<string>> {
  const nspWithRoom = nsp.in(room);
  return promisify(nspWithRoom.clients.bind(nspWithRoom))();
}