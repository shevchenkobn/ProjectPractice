import { ISessionDocument } from "../models/session.model";
import { IGameDocument } from "../models/game.model";
import { ObjectId } from "bson";

export type SocketHandler = (socket: AuthorizedSocket) => void
export type SocketMiddleware = (socket: SocketIO.Socket, fn: ( err?: any ) => void) => void
export type AllowRequestHandler = (request:any, callback: (err: number, success: boolean) => void) => void;
export type SocketIOInitializer = (server: SocketIO.Server) => Array<ISocketIoNamespace>;
export type NamespaceClientsCallback = (err: any, clients: Array<string>) => any;

export interface ISocketIoNamespace {
  connectionHandler: SocketHandler;
  middlewares?: Array<SocketMiddleware>;
  name: string
}

export class NamespaceMiddlewareError {
  message: any;
  code: number

  constructor(message: any, code?: number) {
    this.message = {
      message
    }
    if (code) {
      this.code = code;
    }
  }
}

export interface AuthorizedSocket extends SocketIO.Socket {
  data: {
    sessionId: string,
    gameId: string
  }
}