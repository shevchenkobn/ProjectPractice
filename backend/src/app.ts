import KoaApplication, { Middleware } from 'koa';
import KoaRouter from 'koa-router';
import KoaBody, { IKoaBodyOptions } from 'koa-body';

import { validate } from 'swagger2-koa';
///
import ExpressApp, {Express, Router, Handler} from 'express';
import BodyParser from 'body-parser';
import Multer from 'multer';
import { Server } from 'http';

import SwaggerTools from 'swagger-tools';
import { loadSwaggerDocument } from './services/swagger.service';
import { EventEmitter } from 'events';

SwaggerTools.initializeMiddleware(null, middleware => {
  
});

export class App {
  protected readonly _app: Express;
  protected readonly _routers: Array<Router>;
  protected readonly _middlewares: Array<Handler>;

  constructor(middlewares: Array<Handler>, uploadDir?: string, routes: Array<Router> = []) {
    this._app = ExpressApp();
    this._routers = routes;
    this._middlewares = middlewares;

    this._app.use(
      BodyParser.urlencoded(),
      BodyParser.json(),
      BodyParser.raw(),
      Multer().any()
    );

    if (middlewares) {
      for (let middleware of this._middlewares) {
        this._app.use(middleware);
      }
    }

    for (let router of this._routers) {
      this._app.use(router);
    }
  }

  listen(port: number, callback?: (app: Express) => void): Promise<Server> {
    return Promise.resolve(this._app.listen(port, () => callback && callback(this._app)));
  }
}

export class SwaggerApp extends App {
  private readonly _swaggerConfigPath: string
  private readonly _swaggerDocument: any

  private _initializingSwagger: boolean = false;
  private _eventEmitter: EventEmitter = new EventEmitter();
  private _listenTasks: Array<Promise<Server>> = [];

  constructor(swaggerConfigPath: string, middlewares: Array<Handler>, uploadDir?: string, routes: Array<Router> = []) {
    super(middlewares, uploadDir, routes);

    this._swaggerConfigPath = swaggerConfigPath;
    this._swaggerDocument = loadSwaggerDocument(this._swaggerConfigPath);

    this._initializingSwagger = true;
    SwaggerTools.initializeMiddleware(null, middleware => {
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

/////

export abstract class _koaApp {
  protected readonly _app: KoaApplication
  protected readonly _routers: Array<KoaRouter>
  protected readonly _middlewares: Array<Middleware>

  constructor(routes: Array<KoaRouter>, uploadDir?: string, middlewares?: Array<Middleware>) {
    this._app = new KoaApplication();
    this._routers = routes;
    this._middlewares = middlewares;

    const koaBodyOptions: IKoaBodyOptions = {
      multipart: true,
      urlencoded: true
    }
    if (uploadDir) {
      koaBodyOptions.formidable = { uploadDir };
    }
    this._app.use(KoaBody(koaBodyOptions));
    // this._app.use(session({}, this._app));
    if (middlewares) {
      for (let middleware of this._middlewares) {
        this._app.use(middleware);
      }
    }

    for (let route of this._routers) {
      this._app.use(route.routes());
    }
  }

  listen(port: number, callback?: (app: KoaApplication) => void): Server {
    try {
      return this._app.listen(port, () => callback && callback(this._app));
    } catch (err) {
      throw err;
    }
  }
}

export class _koaSwaggerApp extends _koaApp {
  private readonly _swaggerConfigPath: string
  private readonly _swaggerDocument: any
  private readonly _swaggerValidator: Middleware

  constructor(swaggerConfigPath: string, routes: Array<KoaRouter>, uploadDir?: string, middlewares?: Array<Middleware>) {
    const document = loadSwaggerDocument(swaggerConfigPath);

    const validator: Middleware = validate(document);
    if (middlewares) {
      middlewares.unshift(validator);
    } else {
      middlewares = [validator];
    }
    super(routes, uploadDir, middlewares);
    this._middlewares.shift();

    this._swaggerConfigPath = swaggerConfigPath;
    this._swaggerDocument = document;
    this._swaggerValidator = validator;
  }
}