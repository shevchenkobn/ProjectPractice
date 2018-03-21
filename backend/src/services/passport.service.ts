import passport from 'passport';
import mongoose from 'mongoose';
import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import {OAuth2Strategy as GoogleStrategy} from 'passport-google-oauth';
import UserInitializer from '../models/user.model';
import { IUserModel } from '../models/user.model';
import { IAuthenticationService, getService, IAuthState, IJwtPayload, ClientAuthError, authConfig } from './authentication.service';
import SessionInitializer, { ISessionModel } from '../models/session.model';
import { Handler, Router } from 'express';
import { IReadyRouter } from '../routes';

export interface IGoogleStrategyOpts {
  clientID: string;
  clientSecret: string;
  callbackURL: string
}

export interface IPassportMiddlewares {
  jwtAuthenticate: Handler;
  addGoogleLogin(router: Router, method?: 'get' | 'post'): Router;
}

let User: IUserModel;
let Session: ISessionModel;
let initialized = false;
let authService: IAuthenticationService;
let googleStrategyOpts: IGoogleStrategyOpts;

let googleInited = false;
const middlewares: IPassportMiddlewares = {
  jwtAuthenticate(req, res, next) {
    passport.authenticate('jwt', { session: false }, function(err, state: IAuthState, info) {
      if (err) {
        next(err);
      }
      if (!state) {
        next(info);
      }
      req.login(state, next);
    })(req, res, next)
  },

  addGoogleLogin(router: Router, method: 'get' | 'post' = 'get'): Router {
    if (googleInited) {
      throw new Error('Google authentication is already implemented')
    }
    router[method](authConfig.oauth.google.path, passport.authenticate('google', {
      scope: [
        'https://www.googleapis.com/auth/plus.login',
  	    'https://www.googleapis.com/auth/plus.profile.emails.read'
      ]
    }));
    router[method](authConfig.oauth.google.path + googleStrategyOpts.callbackURL, passport.authenticate('google'));
    
    return router;
  } 
}

export function initialize(userModel: IUserModel = UserInitializer.getModel()): typeof passport {
  if (initialized) {
    return passport;
  }
  User = userModel;
  Session = SessionInitializer.getModel();
  authService = getService();
  googleStrategyOpts = <IGoogleStrategyOpts>JSON.parse(JSON.stringify(authConfig.oauth.google.strategyOptions));

  passport.use('jwt', new JwtStrategy(<any>{
    secretOrKey: authConfig.jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    session: false
  }, async (jwtPayload: IJwtPayload, done: VerifiedCallback) => {
    try {
      const state = await authService.authenticate(jwtPayload.id);
      done(null, state);
    } catch (err) {
      if (err instanceof ClientAuthError) {
        done(null, false, err);
      } else {
        done(err);
      }
    }
  }));

  const callbackURL = authConfig.basePath
    + authConfig.oauth.google.path
    + googleStrategyOpts.callbackURL;
  passport.use('google', new GoogleStrategy(
    {
      ...googleStrategyOpts,
      callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
      /* ARGUMENTS:
      { 
        '0': 'ya29.GmCFBXpi-2TEgbYuPDiJInt0KgDZ5IzLEX3b8oqw1JRfRiQ0ZwV5I7aEN3oNqAHcyBRBv4ZYtK-tY689WfYtwxMLdpZGcNDR7UJHGlBErBN4SwRYLU8KpEsFMmXniYdJIMI',
        '1': undefined,
        '2':
        { id: '113784419737640659144',
          displayName: 'guf tyi',
          name: { familyName: 'tyi', givenName: 'guf' },
          emails: [ [Object] ],
          photos: [ [Object] ],
          gender: 'female',
          provider: 'google',
          _raw: '{\n "kind": "plus#person",\n "etag": "\\"EhMivDE25UysA1ltNG8tqFM2v-A/lkzJLS1hhHVI8cLsPXbmH2NLzA4\\"",\n "gender": "female",\n "emails": [\n  {\n   "value": "rocktron403@gmail.com",\n   "type": "account"\n  }\n ],\n "objectType": "person",\n "id": "113784419737640659144",\n "displayName": "guf tyi",\n "name": {\n  "familyName": "tyi",\n  "givenName": "guf"\n },\n "url": "https://plus.google.com/113784419737640659144",\n "image": {\n  "url": "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg?sz=50",\n  "isDefault": true\n },\n "isPlusUser": true,\n "language": "ru",\n "ageRange": {\n  "min": 21\n },\n "circledByCount": 0,\n "verified": false\n}\n',
          _json:
            { kind: 'plus#person',
              etag: '"EhMivDE25UysA1ltNG8tqFM2v-A/lkzJLS1hhHVI8cLsPXbmH2NLzA4"',
              gender: 'female',
              emails: [Array],
              objectType: 'person',
              id: '113784419737640659144',
              displayName: 'guf tyi',
              name: [Object],
              url: 'https://plus.google.com/113784419737640659144',
              image: [Object],
              isPlusUser: true,
              language: 'ru',
              ageRange: [Object],
              circledByCount: 0,
              verified: false } },
        '3': [Function: verified]
      }
      */
      console.log('STRATEGY AUTH')
      console.log(arguments);
      debugger;
    }
  ));

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

export function getMiddlewares(): IPassportMiddlewares {
  if (!initialized) {
    throw new Error('Passport service is uninitialized');
  }
  return middlewares;
}