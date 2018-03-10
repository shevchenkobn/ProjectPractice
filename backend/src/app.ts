import KoaApplication from 'koa';
import KoaRouter from 'koa-router';
import { Server } from 'http';

export class App {
  private _app: KoaApplication
  private _routers: Array<KoaRouter>

  constructor(routes: Array<KoaRouter>) {
    this._app = new KoaApplication();
    this._routers = routes;
    for (let route of routes) {
      this._app.use(route.routes());
    }
  }

  async listen(port: number): Promise<Server> {
    try {
      return this._app.listen(port);
    } catch (err) {
      return err;
    }
  }
}