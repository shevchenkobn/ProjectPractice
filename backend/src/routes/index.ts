import KoaRouter from 'koa-router';
import { initialize as authRouterInitialize } from './auth.route';

let apiRoutes: Array<KoaRouter>;

export function initialize(): Array<KoaRouter> {
  if (apiRoutes) {
    return apiRoutes;
  }
  apiRoutes = [];
  apiRoutes.push(authRouterInitialize());
  return apiRoutes;
}