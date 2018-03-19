import passport from 'koa-passport';
import mongoose from 'mongoose';
import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import {OAuth2Strategy as GoogleStrategy} from 'passport-google-oauth';
import UserInitializer from '../models/user.model';
import { IUserModel } from '../models/user.model';
import { IAuthenticationService, getService, IState, IJwtPayload, ClientError, authConfig } from './authentication.service';
import SessionInitializer, { ISessionModel } from '../models/session.model';

export interface IGoogleOAuth2Options {
  clientID: string;
  clientSecret: string;
  callbackURL: string
}

let User: IUserModel;
let Session: ISessionModel;
let initialized = false;
let authService: IAuthenticationService;
let googleOauthOptions: IGoogleOAuth2Options;

export function initialize(userModel: IUserModel = UserInitializer.getModel()): typeof passport {
  if (initialized) {
    return passport;
  }
  User = userModel;
  Session = SessionInitializer.getModel();
  authService = getService();
  googleOauthOptions = authConfig.oauth.google.strategyOptions;

  passport.use('jwt', new JwtStrategy({
    secretOrKey: authConfig.jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
  }, async (jwtPayload: IJwtPayload, done: VerifiedCallback) => {
    try {
      const state = authService.authenticate(jwtPayload.id);
      done(null, state);
    } catch (err) {
      if (err instanceof ClientError) {
        done(null, false, err);
      } else {
        done(err);
      }
    }
  }));

  passport.use('google', new GoogleStrategy(googleOauthOptions, function(accessToken, refreshToken, profile, done) {
    console.log(arguments);
    debugger;
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