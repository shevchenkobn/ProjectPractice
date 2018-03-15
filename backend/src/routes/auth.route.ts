import KoaRouter from 'koa-router';
import { AuthController } from '../controllers/auth.controller';

let router: KoaRouter;
let controller: AuthController;
export function initialize(): KoaRouter {
  if (router) {
    return router;
  }
  router = new KoaRouter({
    prefix: '/auth'
  });
  
  controller = new AuthController();
  router.post('/login', controller.login);
  router.get('/logout', controller.logout);
  router.post('/register', controller.register);
  return router;
}