import { initialize as authRouterInitialize } from './auth.route';
import { initialize as gameRouterInitialize } from './game.route';
import { Router } from 'express';

export interface IReadyRouter {
  path: string;
  router: Router
}

let apiRoutes: Array<IReadyRouter>;

export function initialize(): Array<IReadyRouter> {
  if (apiRoutes) {
    return apiRoutes;
  }
  apiRoutes = [];
  apiRoutes.push(authRouterInitialize(), gameRouterInitialize());
  return apiRoutes;
}