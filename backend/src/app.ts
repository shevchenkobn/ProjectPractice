import KoaApplication from 'koa';
import KoaRouter from 'koa-router';
import { Server } from 'http';

import * as swagger from 'swagger2';
import { router as swaggerRouter, Router } from 'swagger2-koa';

export abstract class BaseApp {
  protected readonly _app: KoaApplication

  protected constructor(app: KoaApplication) {
    if (!app) {
      throw new TypeError('app must be an object');
    }
    this._app = app;
  }

  async listen(port: number, callback?: () => void): Promise<Server> {
    try {
      return this._app.listen(port, callback);
    } catch (err) {
      return err;
    }
  }
}

export class App extends BaseApp {
  private readonly _routers: Array<KoaRouter>

  constructor(routes: Array<KoaRouter>) {
    super(new KoaApplication());
    this._routers = routes;

    for (let route of this._routers) {
      this._app.use(route.routes());
    }
  }
}

export class SwaggerApp extends BaseApp {
  private readonly _swaggerConfigPath: string
  private readonly _swaggerDocument: any
  private readonly _swaggerRouter: Router

  constructor(swaggerConfigPath: string) {
    const document = swagger.loadDocumentSync(swaggerConfigPath);
    const router = swaggerRouter(document);
    
    super(router.app());
    
    this._swaggerConfigPath = swaggerConfigPath;
    this._swaggerDocument = document;
    this._swaggerRouter = router;
  }
}