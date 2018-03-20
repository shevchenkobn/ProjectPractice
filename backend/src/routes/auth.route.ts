import { Handler, Router } from 'express';
import config from 'config';

import { authConfig } from './../services/authentication.service';
import { IAuthController, getController } from './../controllers/auth.controller';
////
import KoaRouter from 'koa-router';

let _router: KoaRouter;
let _controller: IAuthController;

export function _initialize(): KoaRouter {
  if (_router) {
    return _router;
  }
  _controller = getController();
  
  _router = new KoaRouter({
    prefix: authConfig.basePath
  });
  
  _router.post(authConfig.basic.register, _controller.register);
  _router.post(authConfig.basic.issueToken, _controller.issueToken);
  _router.post(authConfig.basic.revokeToken, _controller.revokeToken);
  return _router;
}
////
let router: Router;
let controller: IAuthController;