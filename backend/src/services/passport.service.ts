import passport from 'passport';
import mongoose from 'mongoose';
import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import {OAuth2Strategy as GoogleStrategy} from 'passport-google-oauth';
import UserInitializer, { IGoogleInfo } from '../models/user.model';
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
      url: string;
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
      scope: ['email']
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
        "0":"ya29.GluFBZq8pJ9s39uUnj8T2GwoKmTSKLofKrYa9--zE6oBwJyNCAKP8YvXcBYweLn4G-umKcAIg0mXy_KKWW2Zx0ESErKgwNt7oSpamew-uQNOv6MrD__nfIMfdpCA",
        "2":{
          "id":"106746334478871215654",
          "displayName":"Богдан Шевченко",
          "name":{
            "familyName":"Шевченко",
            "givenName":"Богдан"
          },
          "emails":[
            {
              "value":"bohdan.shevchenko1@nure.ua",
              "type":"account"
            }
          ],
          "photos":[
            {
              "value":"https://lh4.googleusercontent.com/-LnqTdC5yRVY/AAAAAAAAAAI/AAAAAAAAAA4/6hF1gZwvoAM/photo.jpg?sz=50"
            }
          ],
          "gender":"male",
          "provider":"google",
          "_raw":"{\n \"kind\": \"plus#person\",\n \"etag\": \"\\\"EhMivDE25UysA1ltNG8tqFM2v-A/JmV5LM_39BiFAbEOjQUqsQ-EWxE\\\"\",\n \"gender\": \"male\",\n \"emails\": [\n  {\n   \"value\": \"bohdan.shevchenko1@nure.ua\",\n   \"type\": \"account\"\n  }\n ],\n \"objectType\": \"person\",\n \"id\": \"106746334478871215654\",\n \"displayName\": \"Богдан Шевченко\",\n \"name\": {\n  \"familyName\": \"Шевченко\",\n  \"givenName\": \"Богдан\"\n },\n \"url\": \"https://plus.google.com/106746334478871215654\",\n \"image\": {\n  \"url\": \"https://lh4.googleusercontent.com/-LnqTdC5yRVY/AAAAAAAAAAI/AAAAAAAAAA4/6hF1gZwvoAM/photo.jpg?sz=50\",\n  \"isDefault\": false\n },\n \"organizations\": [\n  {\n
        \"name\": \"Kharkiv National University of Radioelectronics\",\n   \"type\": \"school\",\n   \"endDate\": \"2016\",\n   \"primary\": false\n  }\n ],\n \"placesLived\": [\n  {\n   \"value\": \"Ukraine\",\n   \"primary\": true\n  }\n
      ],\n \"isPlusUser\": true,\n \"circledByCount\": 0,\n \"verified\": false,\n \"domain\": \"nure.ua\"\n}\n",
          "_json":{
            "kind":"plus#person",
            "etag":"\"EhMivDE25UysA1ltNG8tqFM2v-A/JmV5LM_39BiFAbEOjQUqsQ-EWxE\"",
            "gender":"male",
            "emails":[
              {
                "value":"bohdan.shevchenko1@nure.ua",
                "type":"account"
              }
            ],
            "objectType":"person",
            "id":"106746334478871215654",
            "displayName":"Богдан Шевченко",
            "name":{
              "familyName":"Шевченко",
              "givenName":"Богдан"
            },
            "url":"https://plus.google.com/106746334478871215654",
            "image":{
              "url":"https://lh4.googleusercontent.com/-LnqTdC5yRVY/AAAAAAAAAAI/AAAAAAAAAA4/6hF1gZwvoAM/photo.jpg?sz=50",
              "isDefault":false
            },
            "organizations":[
              {
                "name":"Kharkiv National University of Radioelectronics",
                "type":"school",
                "endDate":"2016",
                "primary":false
              }
            ],
            "placesLived":[
              {
                "value":"Ukraine",
                "primary":true
              }
            ],
            "isPlusUser":true,
            "circledByCount":0,
            "verified":false,
            "domain":"nure.ua"
          }
        }
      }
      */
      console.log('STRATEGY AUTH')
      console.log(JSON.stringify(arguments));
      
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

function normalizeProfile(profile: IGoogleProfile): IGoogleInfo {
  let photos: Array<any> = profile.photos;
  const avatar = profile._json.image;
  const avatarIdx = photos.findIndex(photo => photo.url === avatar.url);
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
    id: profile.id,
    displayName: profile.displayName,
    name: profile.name,
    gender: profile.gender,
    emails,
    photos,
    profileUrl: profile._json.url,
    organizations: profile._json.organizations,
    placesLived: profile._json.placesLived,
    isPlusUser: profile._json.isPlusUser,
    circledByCount: profile._json.circledByCount,
    verified: profile._json.verified,
    domain: profile._json.domain
  };
}