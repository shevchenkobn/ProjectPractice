import { Middleware } from 'koa';
import passport from 'koa-passport';
import { IState } from '../services/authentication.service';
import KoaRouter from 'koa-router';

let router: KoaRouter;

export function initialize(): KoaRouter {
  if (router) {
    return router;
  }
  router = new KoaRouter({
    prefix: '/game'
  });
  router.get('/', (ctx, next) => passport.authenticate('jwt', function(err, state: IState, info, status) {
    if (err) {
      ctx.throw(500, err);
    }
    ctx.body = arguments;
  })(ctx, next));
  return router;
}