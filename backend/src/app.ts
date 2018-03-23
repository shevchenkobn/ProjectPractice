import appRoot from 'app-root-path';
import ExpressApp, {Express, Router, Handler, ErrorRequestHandler} from 'express';
import BodyParser from 'body-parser';
import Multer from 'multer';
import { Server } from 'http';
import { EventEmitter } from 'events';

import SwaggerTools, { SwaggerRouter20Options, SwaggerValidatorOptions, SwaggerUiOptions, SwaggerSecurityOptions } from 'swagger-tools';
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
      
    );
    if (uploadDir) {
      this._app.use(
        Multer({
          dest: uploadDir
        }).any()
      );
    }

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

export interface ISwaggerConfig {
  filepath: string;
  routerOptions: SwaggerRouter20Options;
  validatorOptions?: SwaggerValidatorOptions;
  securityOptions?: SwaggerSecurityOptions;
  uiOptions?: SwaggerUiOptions;
}

export interface ISwaggerAppConfig {
  swagger: ISwaggerConfig;
  middlewares: IHandlersArray;
  uploadDir?: string;
  routes?: Array<IReadyRouter>;
}

export class SwaggerApp extends App {
  private readonly _swaggerConfig: ISwaggerConfig
  private readonly _swaggerDocument: any

  private _initializingSwagger: boolean = false;
  private readonly _eventEmitter: EventEmitter = new EventEmitter();
  private _listenTasks: Array<Promise<Server>> = [];

  //constructor(swaggerConfigPath: string, middlewares: IHandlersArray, uploadDir?: string, routes: Array<IReadyRouter> = []) {
  constructor(config: ISwaggerAppConfig) {
    super(config.middlewares, config.uploadDir, config.routes);

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