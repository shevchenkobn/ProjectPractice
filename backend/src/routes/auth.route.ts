import { Handler, Router } from 'express';
import config from 'config';

import { IReadyRouter } from '.';
import { authConfig } from './../services/authentication.service';
import { IAuthController, getController } from './../controllers/auth.controller';
import { getMiddlewares } from '../services/passport.service';

let readyRouter: IReadyRouter;
let controller: IAuthController;

export function initialize(): IReadyRouter {
  if (readyRouter) {
    return readyRouter;
  }
  controller = getController();

  const { addGoogleLogin } = getMiddlewares();
  const router = Router();

  router.post(authConfig.basic.register, controller.register);
  router.post(authConfig.basic.issueToken, controller.issueToken);
  router.post(authConfig.basic.revokeToken, controller.revokeToken);

  addGoogleLogin(router, 'get');

  readyRouter = {
    router,
    path: authConfig.basePath
  }

  return readyRouter;
}