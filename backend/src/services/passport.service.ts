import passport from 'koa-passport';
import mongoose from 'mongoose';
import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import UserInitializer from '../models/user.model';
import { IUserModel } from '../models/user.model';
import { IAuthenticationService, getService, IState, IJwtPayload } from './authentication.service';
import config from 'config';
import SessionInitializer, { ISessionModel } from '../models/session.model';

let User: IUserModel;
let Session: ISessionModel;
let initialized = false;
let authService: IAuthenticationService;

export function initialize(userModel: IUserModel = UserInitializer.getModel()): typeof passport {
  if (initialized) {
    return passport;
  }
  User = userModel;
  Session = SessionInitializer.getModel();
  authService = getService();

  passport.use('jwt', new JwtStrategy({
    secretOrKey: config.get<string>('jwtSecret'),
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
  }, async (jwtPayload: IJwtPayload, done: VerifiedCallback) => {
    try {
      const session = await Session.findOne({
        _id: jwtPayload.id,
        status: 'active'
      });
      if (!session) {
        return done(null, false, 'Invalid Token');
      }
      const user = await User.findById(session.userId);
      if (!user) {
        throw new Error('Non-existing user');
      }
      done(null, {
        user,
        session
      });
    } catch (err) {
      done(err);
    }
  }));

  /**
   * The thing about passport that sucks is mandatory session making
   */
  passport.serializeUser<any, any>((user, done) => {
    done(null, 1);
  });
  passport.deserializeUser<any, any>((id, done) => {
    done(null, 1);
  });

  initialized = true;
  return passport;
}