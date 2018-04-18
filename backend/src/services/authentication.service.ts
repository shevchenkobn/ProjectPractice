import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken'
import UserInitializer, { IUserModel, IUserDocument } from '../models/user.model';
import SessionInitializer, { ISessionModel, ISessionDocument } from '../models/session.model';
import config from 'config';
import { ExtractJwt, JwtFromRequestFunction } from 'passport-jwt';
import { Request } from 'express';
import { ClientRequestError, AccessError } from './error-handler.service';
import { SwaggerSecurityHandler } from 'swagger-tools';

export class ClientAuthError extends ClientRequestError {}

export interface IAuthConfig {
  basePath: string,
  basic: {
    issueToken: string,
    register: string,
    revokeToken: string
  },
  oauth: {
    google: {
      path: string,
      strategyOptions: {
        clientID: string,
        clientSecret: string,
        callbackURL: string
      }
    }
  },
  jwtSecret: string
  sessionLimit: number
}

export interface IAuthResponse {
  token: string;
  user: IUserDocument;
}

export interface IJwtPayload {
  id: string
}

export interface IAuthenticationService {
  getNewSession(credentials: any): Promise<ISessionDocument>;
  getSessionFromToken(token: string): Promise<ISessionDocument>;
  getResponse(state: ISessionDocument): IAuthResponse;
  generateToken(session: ISessionDocument): string;
  getState(req: Request): ISessionDocument;
  authenticate(sessionId: string): Promise<ISessionDocument>;
  createUser(object: any): Promise<IUserDocument>;
  createSession(user: IUserDocument): Promise<ISessionDocument>;
  revokeToken(req: Request, token?: string | boolean): Promise<void>;
  getToken(req: Request, fromBody?: boolean): string;
  swaggerBearerJwtChecker: SwaggerSecurityHandler;
} 

export const authConfig = config.get<IAuthConfig>('auth');
let _secret = authConfig.jwtSecret;
let tokenExtractor: JwtFromRequestFunction;
let User: IUserModel = null;
let Session: ISessionModel = null;

let service: IAuthenticationService = null;

export function getService(): IAuthenticationService {
  if (service) {
    return service;
  }
  User = UserInitializer.getModel();
  Session = SessionInitializer.getModel();
  tokenExtractor = ExtractJwt.fromAuthHeaderAsBearerToken();
  service = {
    generateToken(session) {
      const payload: IJwtPayload = session.toObject();
      return jwt.sign(payload, _secret);
    },

    async getSessionFromToken(token) {
      let decoded;
      try {
        decoded = <IJwtPayload>jwt.verify(token, _secret);
      } catch (err) {
        throw new AccessError('Invalid token');
      }
      return await service.authenticate(decoded.id);
    },

    getResponse(session) {
      if (!(session.user instanceof User)) {
        throw new TypeError('Session is not populated with user');
      }
      return {
        token: service.generateToken(session),
        user: <IUserDocument>session.user
      };
    },

    async getNewSession(credentials) {
      if (!User.isConstructionObject(credentials)) {
        throw new ClientAuthError("Bad login object");
      }
      const user = await User.findOne({
        username: credentials.username
      });
      if (!(user && user.checkPassword(credentials.password))) {
        throw new ClientAuthError("Bad username or password");
      }
      
      return await service.createSession(user);
    },

    getState(req) {
      return <any>req.user;
    },

    async authenticate(sessionId) {
      if (!sessionId.trim()) {
        throw new Error("SessionId is empty");
      }
      const session = await Session.findOne({
        _id: sessionId,
        status: 'active'
      });
      if (!session) {
        throw new ClientAuthError("Invalid Token");
      }
      await session.populate('user').execPopulate();
      return session;
    },

    async createSession(user) {
      if (user instanceof User) {
        if (
          await Session.count({
            user: user._id,
            status: 'active'
          }) >= authConfig.sessionLimit
        ) {
          throw new ClientAuthError(`Maximum number of tokens (${authConfig.sessionLimit}) had already been issued!`);
        }
        const session = new Session({
          user: user._id
        });
        await session.save();
        await session.populate('user').execPopulate();
        return session;
      } else {
        throw new Error('user is not a model');
      }
    },

    /**
     * Rejects either with string (user error) or Error (server error)
     * @param object Object obtained from request
     */
    createUser(object) {
      return new Promise<IUserDocument>(async (resolve, reject) => {
        try {
          if (!User.isConstructionObject(object)) {
            return reject(new ClientAuthError("Bad registration object"));
          }
          let user = await User.findOne({username: object.username});
          if (!user) {
            user = new User(object);
            await user.save();
            resolve(user);
          } else {
            reject(new ClientAuthError("Username is occupied"));
          }
        } catch (err) {
          reject(err);
        }
      });
    },

    async revokeToken(req, token = '') {
      if (token === true) {
        token = service.getToken(req, token);
      } else if (typeof token === 'string') {
        if (token = !token.trim()) {
          token = service.getToken(req);
        }
      }
      if (!token) {
        throw new ClientAuthError('Authorization token must be provided either in body or in "Authorization" header');
      }
      const session = await Session.findOne({
        _id: (jwt.verify(<string>token, _secret) as IJwtPayload).id,
        status: 'active'
      });
      if (!session) {
        throw new ClientAuthError('Invalid Token');
      }
      session.status = 'outdated';
      await session.save();
      req.logout();
    },
  

    getToken(req: Request, fromBody = false): string {
      return fromBody && req.body && req.body.token && (req.body.token + '').trim() || tokenExtractor(req);
    },

    async swaggerBearerJwtChecker(req: Request, authOrSecDef, scopesOrApiKey, callback) {
      try {
        const token = service.getToken(req);
        if (!token || typeof token === 'string' && !token.trim()) {
          return callback(new AccessError('Access token must be provided'));
        }
        const session = await service.getSessionFromToken(token);
        req.login(session, err => {
          if (err) callback(err);
          callback();
        });
      } catch (err) {
        callback(err);
      }
    }
  };
  return service;
} 