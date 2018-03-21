import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken'
import UserInitializer, { IUserModel, IUserDocument } from '../models/user.model';
import SessionInitializer, { ISessionModel, ISessionDocument } from '../models/session.model';
import config from 'config';
import { ExtractJwt, JwtFromRequestFunction } from 'passport-jwt';
import { Request } from 'express';
import { ClientRequestError } from './error-handler.service';

export class ClientAuthError extends ClientRequestError {}

export interface IAuthPaths {
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
}

export interface IAuthState {
  user: IUserDocument;
  session: ISessionDocument
}

export interface IJwtPayload {
  id: string
}

export interface IAuthenticationService {
  getToken(credentials: any): Promise<IAuthState>;
  generateToken(session: ISessionDocument): string;
  getState(req: Request): IAuthState;
  authenticate(token: string): Promise<IAuthState>;
  createUser(object: any): Promise<IUserDocument>;
  createSession(user: IUserDocument): Promise<ISessionDocument>;
  logout(req: Request, token?: string): Promise<void>;
} 

export const authConfig = config.get<IAuthPaths>('auth');
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
      const payload: IJwtPayload = {
        id: session.id
      };
      return jwt.sign(payload, _secret);
    },

    async getToken(credentials) {
      if (!User.isConstructionDoc(credentials)) {
        throw new ClientAuthError("Bad login object");
      }
      const user = await User.findOne({
        username: credentials.username
      });
      if (!(user && user.checkPassword(credentials.password))) {
        throw new ClientAuthError("Bad username or password");
      }
      const session = await service.createSession(user);
      return {
        user,
        session
      };
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
      const user = await User.findById(session.userId);
      return {
        user,
        session
      };
    },

    async createSession(user) {
      if (user instanceof User) {
        const session = new Session({
          userId: new mongoose.Types.ObjectId(user._id)
        });
        await session.save();
        return session;
      } else {
        throw new Error('user is not a model or token is empty');
      }
    },

    /**
     * Rejects either with string (user error) or Error (server error)
     * @param object Object obtained from request
     */
    createUser(object) {
      return new Promise<IUserDocument>(async (resolve, reject) => {
        try {
          if (!User.isConstructionDoc(object)) {
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

    async logout(req, token = '') {
      if (!token.trim()) {
        token = getToken(req);
      }
      const session = await Session.findOne({
        _id: (jwt.verify(token, _secret) as IJwtPayload).id,
        status: 'active'
      });
      if (!session) {
        throw new ClientAuthError('Invalid Token');
      }
      session.status = 'outdated';
      await session.save();
      req.logout();
    }
  };
  return service;
}

function getToken(req: Request): string {
  return tokenExtractor(req);
}