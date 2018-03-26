import appRoot from 'app-root-path';
import ExpressApp, {Express, Router, Handler, ErrorRequestHandler} from 'express';
import BodyParser from 'body-parser';
import cors from 'cors';
import Multer from 'multer';
import { Server } from 'http';
import { EventEmitter } from 'events';

import Socket from 'socket.io';
import Path from 'path';

import SwaggerTools, { SwaggerRouter20Options, SwaggerValidatorOptions, SwaggerUiOptions, SwaggerSecurityOptions } from 'swagger-tools';
import { loadSwaggerDocument } from './services/swagger.service';
import { IReadyRouter } from './routes';
import { SocketHandler, SocketMiddleware, ISocketIOConfig } from './socketio-api/@types';

export interface ISwaggerConfig {
  filepath: string;
  routerOptions: SwaggerRouter20Options;
  validatorOptions?: SwaggerValidatorOptions;
  securityOptions?: SwaggerSecurityOptions;
  uiOptions?: SwaggerUiOptions;
}

export interface IAppConfig {
  express: IExpressConfig;
  socketio?: ISocketIOConfig;
}

export interface IExpressConfig {
  middlewares?: IHandlersArray;
  uploadDir?: string;
  routes?: Array<IReadyRouter>;
}

export interface ISwaggerAppConfig {
  swagger: ISwaggerConfig;
  appConfig: IAppConfig;
}

export interface IHandlersArray {
  before: Array<Handler | ErrorRequestHandler>;
  after: Array<Handler | ErrorRequestHandler>;
}

export class App {
  protected readonly _app: Express;
  protected _server: Server;
  protected _socketIo: SocketIO.Server;
  protected readonly _expressConfig: IExpressConfig;
  protected readonly _socketIoConfig: ISocketIOConfig;

  private _middlewaresInUse: boolean;

  constructor(config: IAppConfig) {
    this._app = ExpressApp();
    this._expressConfig = config.express;
    if (!this._expressConfig.middlewares) {
      this._expressConfig.middlewares = {
        before: [],
        after: []
      };
    }
    if (this._expressConfig.routes) {
      this._expressConfig.routes = [];
    }

    this._app.use(
      BodyParser.urlencoded({
        extended: true
      }),
      BodyParser.json(),
      BodyParser.raw(),
      cors()
    );
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      this._app.use('/debug', (req, res, next) => {
        res.sendFile(Path.resolve(__dirname, '../debug/index.html'));
      });
    }
    if (this._expressConfig.uploadDir) {
      this._app.use(
        Multer({
          dest: this._expressConfig.uploadDir
        }).any()
      );
    }

    this.useMiddlewares(this._expressConfig.middlewares.before);

    for (let router of this._expressConfig.routes) {
      this._app.use(router.path, router.router);
    }
    //// socket io initialization
    this._socketIoConfig = config.socketio;
  }

  private useMiddlewares(middlewares: Array<Handler | ErrorRequestHandler>) {
    if (middlewares && middlewares.length) {
      for (let middleware of middlewares) {
        this._app.use(middleware);
      }
    }
  }

  socketIOListen(port: number) {
    if (this._socketIoConfig) {
      // server = server || this._server;
      // if (!server) {
      //   throw new Error('No server provided nor found in class');
      // }
      this._socketIo = Socket(this._socketIoConfig.serverOptions);
      if (this._socketIoConfig.middlewares && this._socketIoConfig.middlewares.length) {
        for (let middleware of this._socketIoConfig.middlewares) {
          this._socketIo.use(middleware);
        }
      }
      this._socketIo.on('connection', this._socketIoConfig.connectionHandler);
      this._socketIo.listen(port);
    }
  }

  listen(port: number, callback?: (app: Express) => void): Promise<Server> {
    if (!this._middlewaresInUse) {
      this.useMiddlewares(this._expressConfig.middlewares.after);
      this._middlewaresInUse = true;
    }
    const server = this._app.listen(port, () => callback && callback(this._app));
    if (!this._server) {
      this._server = server;
    }
    return Promise.resolve(server);
  }
}

export class SwaggerApp extends App {
  private readonly _swaggerConfig: ISwaggerConfig
  private readonly _swaggerDocument: any

  private _initializingSwagger: boolean = false;
  private readonly _eventEmitter: EventEmitter = new EventEmitter();
  private _listenTasks: Array<Promise<Server>> = [];

  //constructor(swaggerConfigPath: string, middlewares: IHandlersArray, uploadDir?: string, routes: Array<IReadyRouter> = []) {
  constructor(config: ISwaggerAppConfig) {
    super(config.appConfig);

    this._swaggerConfig = config.swagger;
    this._swaggerDocument = loadSwaggerDocument(this._swaggerConfig.filepath);

    this._initializingSwagger = true;
    SwaggerTools.initializeMiddleware(this._swaggerDocument, middleware => {
      this._app.use(middleware.swaggerMetadata());

      if (this._swaggerConfig.securityOptions) {
        this._app.use(middleware.swaggerSecurity(this._swaggerConfig.securityOptions));
      }

      this._app.use(middleware.swaggerValidator(this._swaggerConfig.validatorOptions));
      
      this._app.use(middleware.swaggerRouter(this._swaggerConfig.routerOptions));

      if (this._swaggerConfig.uiOptions) {
        this._app.use(middleware.swaggerUi(this._swaggerConfig.uiOptions));
      }
      
      this.executeTasks();
    });
  }

  private executeTasks() {
    this._initializingSwagger = false;
    this._eventEmitter.emit('init');
    this._listenTasks.length = 0;
  }

  listen(port: number, callback?: (app: Express) => void): Promise<Server> {
    const promise = new Promise<Server>((resolve, reject) => {
      if (this._initializingSwagger) {
        this._eventEmitter.on('init', () => super.listen(port, callback).then(resolve));
      } else {
        super.listen(port, callback).then(resolve);
      }
    });
    if (this._initializingSwagger) {
      this._listenTasks.push(promise);
    }
    return promise;
  }
}