import { authConfig } from './../services/authentication.service';
import { IAuthController, getController } from './../controllers/auth.controller';
import KoaRouter from 'koa-router';
import config from 'config';

let router: KoaRouter;
let controller: IAuthController;

export function initialize(): KoaRouter {
  if (router) {
    return router;
  }
  controller = getController();
  
  router = new KoaRouter({
    prefix: authConfig.basePath
  });
  
  router.post(authConfig.basic.register, controller.register);
  router.post(authConfig.basic.issueToken, controller.issueToken);
  router.post(authConfig.basic.revokeToken, controller.revokeToken);
  return router;
}