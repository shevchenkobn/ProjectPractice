import passport from 'passport';
import mongoose from 'mongoose';
import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import {OAuth2Strategy as GoogleStrategy} from 'passport-google-oauth';
import UserInitializer, { IGoogleInfo, IUserDocument } from '../models/user.model';
import { IUserModel } from '../models/user.model';
import { IAuthenticationService, getService, IJwtPayload, ClientAuthError, authConfig } from './authentication.service';
import SessionInitializer, { ISessionModel, ISessionDocument } from '../models/session.model';
import { Handler, Router } from 'express';
import { IReadyRouter } from '../routes';
import { SwaggerSecurityHandler } from 'swagger-tools';

export interface IGoogleStrategyOpts {
  clientID: string;
  clientSecret: string;
  callbackURL: string
}

export interface IPassportMiddlewares {
  jwtAuthenticate: Handler;
  addGoogleLogin(router: Router, method?: 'get' | 'post'): Router;
}

export interface IGoogleProfile {
  id: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  emails: Array<{
    value: string;
    type: 'account' | string;
  }>;
  photos: Array<{
    value: string
  }>;
  gender: 'male' | 'female';
  provider: 'google';
  _raw: string;
  _json: {
    kind: 'plus#person' | string;
    etag: string;
    gender: 'male' | 'female';
    emails: Array<{
      value: string;
      type: 'account' | string;
    }>;
    displayName: string;
    name: {
      familyName: string;
      givenName: string;
    };
    url: string;
    image: {
      value: string;
      isDefault: boolean;
    },
    organizations?: Array<{
      name: string;
      type: 'school' | string;
      endDate: string;
      primary: boolean
    }>;
    placesLived?: Array<{
      value: string;
      primary: boolean;
    }>;
    isPlusUser: boolean;
    circledByCount: boolean;
    verified: boolean;
    domain?: string
  };
}

let User: IUserModel;
let Session: ISessionModel;
let initialized = false;
let authService: IAuthenticationService;
let googleStrategyOpts: IGoogleStrategyOpts;

let googleInited = false;
const middlewares: IPassportMiddlewares = {
  jwtAuthenticate(req, res, next) {
    passport.authenticate('jwt', { session: false }, function(err, state: ISessionDocument, info) {
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
    router[method](
      authConfig.oauth.google.path,
      (req, res, next) => {
        const token = authService.getToken(req);
        passport.authenticate('google', <any>{
          scope: ['email', 'profile'],
          state: token || undefined
        })(req, res, next);
      }
    );
    router[method](
      authConfig.oauth.google.path + googleStrategyOpts.callbackURL,
      passport.authenticate('google'),
      (req, res, next) => {
        res.json(authService.getResponse(<ISessionDocument>req.user))
      }
    );
    
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
      const session = await authService.authenticate(jwtPayload.id);
      done(null, session);
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
      callbackURL,
      passReqToCallback: true
    },
    async function(req, accessToken, refreshToken, profile: IGoogleProfile, done) {
      try {
        if (!profile) {
          return done(null, false);
        }
        const googleInfo = normalizeProfile(profile);
        if (req.query.state) {
          const session = await authService.getSessionFromToken(req.query.state);
          let user: IUserDocument = await User.findOne({
            'google.id': googleInfo.id,
            id: {
              $ne: (<IUserDocument>session.user).id
            }
          }); // TODO: merge all statistics of the user
          if (user) {
            await Session.find({
              user: user.id
            }).remove().exec();
            await user.remove();
          }
          user = <IUserDocument>session.user;
          if (user.google) {
            await (<any>user.google).remove();
          }
          user.google = googleInfo; // for now just replace google profile without checking IDs
          await user.save();
          done(null, session);
        } else {
          let user = await User.findOne({
            'google.id': googleInfo.id
          });
          if (user) {
            user.google = googleInfo;
          } else {
            user = new User({
              username: googleInfo.displayName,
              google: googleInfo
            });
          }
          await user.save();
          const session = await authService.createSession(user); // TODO: probably access/refresh tokens are essential in here to save
          done(null, session);
        }
      } catch (err) {
        done(err);
      }
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

function normalizeProfile(profile: IGoogleProfile): IGoogleInfo {
  let photos: Array<any> = profile.photos;
  const avatar = profile._json.image;
  const avatarIdx = photos.findIndex(photo => photo.url === avatar.value);
  photos = photos.map((photo, i) => {
    photo = {
      url: photo.value.split('?')[0],
      isProfile: false
    };
    if (avatarIdx === i) {
      photo.isProfile = true;
      photo.isDefault = avatar.isDefault;
    }
    return photo;
  });

  const emails: Array<any> = JSON.parse(JSON.stringify(profile._json.emails));
  const add: Array<number> = [];
  for (let i = 0; i < profile.emails.length; i++) {
    let j = emails.findIndex(email => email.value === profile.emails[i].value);
    if (j < 0) {
      add.push(i);
    }
  }
  for (let i of add) {
    emails.push(JSON.parse(JSON.stringify(profile.emails[i])));
  }

  return {
    emails,
    photos,
    id: profile.id,
    displayName: profile.displayName,
    name: profile.name,
    gender: profile.gender,
    profileUrl: profile._json.url,
    organizations: profile._json.organizations,
    placesLived: profile._json.placesLived,
    isPlusUser: profile._json.isPlusUser,
    circledByCount: profile._json.circledByCount,
    verified: profile._json.verified,
    domain: profile._json.domain
  };
}