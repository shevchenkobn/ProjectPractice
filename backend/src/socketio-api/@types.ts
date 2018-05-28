import { ISessionDocument } from "../models/session.model";
import { IGameDocument } from "../models/game.model";

export type SocketHandler = (socket: AuthorizedSocket) => void
export type SocketMiddleware = (socket: SocketIO.Socket, fn: ( err?: any ) => void) => void
export type AllowRequestHandler = (request:any, callback: (err: number, success: boolean) => void) => void;
export type SocketIOInitializer = (soerver: SocketIO.Server) => Array<ISocketIoNamespace>;

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
    session: ISessionDocument,
    game: IGameDocument
  }
}