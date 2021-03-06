export type SocketHandler = (socket: SocketIO.Socket) => void
export type SocketMiddleware = (socket: SocketIO.Socket, fn: ( err?: any ) => void) => void
export type AllowRequestHandler = (request:any, callback: (err: number, success: boolean) => void) => void;

export interface ISocketIOConfig {
  serverOptions?: SocketIO.ServerOptions;
  namespaces: {
    [nsp: string]: {
      connectionHandler: SocketHandler;
      middlewares?: Array<SocketMiddleware>
    }
  }
}

export class NspMiddlewareError {
  message: any;

  constructor(message: any, code?: number) {
    this.message = {
      message
    }
    if (arguments.length > 1) {
      this.message.code = code;
    }
  }
}