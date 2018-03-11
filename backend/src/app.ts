import KoaApplication, { Middleware } from 'koa';
import KoaRouter from 'koa-router';
import { Server } from 'http';
import KoaBody, { IKoaBodyOptions } from 'koa-body';

import { validate } from 'swagger2-koa';
import { loadSwaggerDocument } from './services/swagger.service';

export abstract class App {
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
    if (middlewares) {
      for (let middleware of this._middlewares) {
        this._app.use(middleware);
      }
    }

    for (let route of this._routers) {
      this._app.use(route.routes());
    }
  }

  async listen(port: number, callback?: (app: KoaApplication) => void): Promise<Server> {
    try {
      return this._app.listen(port, () => callback && callback(this._app));
    } catch (err) {
      throw err;
    }
  }
}

export class SwaggerApp extends App {
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