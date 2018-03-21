import passport from 'passport';
import { IAuthState } from '../services/authentication.service';
import { Router } from 'express';
import { IReadyRouter } from '.';

let readyRouter: IReadyRouter;

export function initialize(): IReadyRouter {
  if (readyRouter) {
    return readyRouter;
  }

  const router = Router();

  router.get(
    '/',
    (req, res, next) => passport.authenticate('jwt', function(err, state: IAuthState, info) {
      if (err) {
        next(err);
      }
      if (!state) {
        next(info);
      }
      req.login(state, next);
    })(req, res, next),
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