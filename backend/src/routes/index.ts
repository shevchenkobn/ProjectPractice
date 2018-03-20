import KoaRouter from 'koa-router';
import { _initialize as authRouterInitialize } from './auth.route';
import { initialize as gameRouterInitialize } from './game.route';

let apiRoutes: Array<KoaRouter>;

export function initialize(): Array<KoaRouter> {
  if (apiRoutes) {
    return apiRoutes;
  }
  apiRoutes = [];
  apiRoutes.push(authRouterInitialize(), gameRouterInitialize());
  return apiRoutes;
}