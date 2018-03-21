import ExpressApp, {Express, Router, Handler, ErrorRequestHandler} from 'express';
import BodyParser from 'body-parser';
import Multer from 'multer';
import { Server } from 'http';
import { EventEmitter } from 'events';

import SwaggerTools from 'swagger-tools';
import { loadSwaggerDocument } from './services/swagger.service';
import { IReadyRouter } from './routes';

export interface IHandlersArray {
  before: Array<Handler | ErrorRequestHandler>;
  after: Array<Handler | ErrorRequestHandler>;
}

export class App {
  protected readonly _app: Express;
  protected readonly _routers: Array<IReadyRouter>;
  protected readonly _middlewares: IHandlersArray;

  private _middlewaresInUse: boolean;

  constructor(middlewares: IHandlersArray, uploadDir?: string, routes: Array<IReadyRouter> = []) {
    this._app = ExpressApp();
    this._routers = routes;
    this._middlewares = middlewares;

    this._app.use(
      BodyParser.urlencoded({
        extended: true
      }),
      BodyParser.json(),
      BodyParser.raw(),
      Multer().any()
    );

    this.useMiddlewares(this._middlewares.before);

    for (let router of this._routers) {
      this._app.use(router.path, router.router);
    }
  }

  private useMiddlewares(middlewares: Array<Handler | ErrorRequestHandler>) {
    if (middlewares && middlewares.length) {
      for (let middleware of middlewares) {
        this._app.use(middleware);
      }
    }
  }

  listen(port: number, callback?: (app: Express) => void): Promise<Server> {
    if (!this._middlewaresInUse) {
      this.useMiddlewares(this._middlewares.after);
      this._middlewaresInUse = true;
    }
    return Promise.resolve(this._app.listen(port, () => callback && callback(this._app)));
  }
}

export class SwaggerApp extends App {
  private readonly _swaggerConfigPath: string
  private readonly _swaggerDocument: any

  private _initializingSwagger: boolean = false;
  private readonly _eventEmitter: EventEmitter = new EventEmitter();
  private _listenTasks: Array<Promise<Server>> = [];

  constructor(swaggerConfigPath: string, middlewares: IHandlersArray, uploadDir?: string, routes: Array<IReadyRouter> = []) {
    super(middlewares, uploadDir, routes);

    this._swaggerConfigPath = swaggerConfigPath;
    this._swaggerDocument = loadSwaggerDocument(this._swaggerConfigPath);

    this._initializingSwagger = true;
    SwaggerTools.initializeMiddleware(this._swaggerDocument, middleware => {
      // do stuff ...
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