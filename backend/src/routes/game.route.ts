import passport from 'passport';
import { IAuthState } from '../services/authentication.service';
import { Router, Handler } from 'express';
import { IReadyRouter } from '.';
import { getMiddlewares } from '../services/passport.service';

let readyRouter: IReadyRouter;

export function initialize(): IReadyRouter {
  if (readyRouter) {
    return readyRouter;
  }

  const { jwtAuthenticate } = getMiddlewares();

  const router = Router();

  router.get(
    '/',
    jwtAuthenticate,
    (req, res, next) => {
      res.json(req.user);
    }
  );
  router.get(
    '/g',
    passport.authenticate('google', async function() {
      console.log(arguments);
      debugger;
    })
  );
  router.get('/g/callback', passport.authenticate('google', async function() {
    console.log(arguments);
    debugger;
  }));

  readyRouter = {
    path: '/game',
    router: router
  };
  return readyRouter;
}