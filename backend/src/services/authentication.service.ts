import { Context } from 'koa';
import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken'
import UserInitializer, { IUserModel, IUserDocument } from '../models/user.model';
import SessionInitializer, { ISessionModel, ISessionDocument } from '../models/session.model';
import config from 'config';
import { ExtractJwt } from 'passport-jwt';
export interface IState {
  user: IUserDocument;
  session: ISessionDocument
}

export interface IJwtPayload {
  id: string
}

export interface IAuthenticationService {
  getResponse(ctx: Context): any; // TODO: json schema
  getToken(credentials: any): Promise<IState>;
  generateToken(session: ISessionDocument): string;
  saveState(ctx: Context, user: IUserDocument, session: ISessionDocument): Promise<void>;
  getState(ctx: Context): IState;
  authenticate(ctx: Context, token: string): Promise<Context>;
  createUser(object: any): Promise<IUserDocument>;
  createSession(user: IUserDocument): Promise<ISessionDocument>;
  logout(ctx: Context, token?: string): Promise<void>;
} 

let _secret = config.get<string>('jwtSecret');
let User: IUserModel = null;
let Session: ISessionModel = null;

let service: IAuthenticationService = null;

export function getService(): IAuthenticationService {
  if (service) {
    return service;
  }
  User = UserInitializer.getModel();
  Session = SessionInitializer.getModel();
  service = {
    generateToken(session) {
      const payload: IJwtPayload = {
        id: session.id
      };
      return jwt.sign(payload, _secret);
    },

    getResponse(ctx) {
      if (ctx.isAuthenticated()) {
        return {
          token: service.generateToken(ctx.state.user.session),
          user: ctx.state.user.user
        };
      } else {
        return null;
      }
    },

    async getToken(credentials) {
      if (!User.isConstructionDoc(credentials)) {
        throw "Bad login object";
      }
      const user = await User.findOne({
        username: credentials.username
      });
      if (!(user && user.checkPassword(credentials.password))) {
        throw "Bad username or password";
      }
      const session = await service.createSession(user);
      return {
        user,
        session
      };
    },

    async saveState(ctx, user, session) {
      await ctx.login({user, session});
      if (ctx.isUnauthenticated()) {
        throw new Error("Undefined login error");
      }
    },

    getState(ctx) {
      return ctx.state.user;
    },

    async authenticate(ctx, token) { // FIXME:
      if (!(ctx && token)) {
        throw new Error("ctx or token is empty");
      }
      const session = await Session.findOne({
        token,
        status: 'active'
      });
      if (!session) {
        throw "Invalid Token";
      }
      const user = await User.findById(session.userId);
      if (!user) {
        throw new Error("In-session user is not found!");
      }
      await service.saveState(ctx, user, session);
      return ctx;
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
            return reject("Bad registration object");
          }
          let user = await User.findOne({username: object.username});
          if (!user) {
            user = new User(object);
            await user.save();
            resolve(user);
          } else {
            reject("Username is occupied")
          }
        } catch (err) {
          reject(err);
        }
      });
    },

    async logout(ctx, token = '') {
      if (!token.trim()) {
        token = getToken(ctx);
      }
      const session = await Session.findOne({
        _id: (jwt.verify(token, _secret) as IJwtPayload).id,
        status: 'active'
      });
      if (!session) {
        throw 'Invalid Token';
      }
      session.status = 'outdated';
      await session.save();
      ctx.logout();
    }
  };
  return service;
}

// const jwtExtractor = ExtractJwt.fromAuthHeaderAsBearerToken();
function getToken(ctx: Context): string {
  const header = ctx.get('Authorization'); 
  if (!header.trim()) {
    if (typeof ctx.request.body === 'object' && ctx.request.body &&
      typeof ctx.request.body.token === 'string' && ctx.request.body.token.trim()) {
      return ctx.request.body.token.trim();
    } else {
      throw 'No token found';
    }
  }
  const parts = header.split(/\s+/);
  let i = 0;
  for (; !parts[i].length; i++);
  if (parts[i].toLocaleLowerCase() !== 'bearer') {
    throw 'Not a Bearer authentication';
  }
  return parts[i + 1];
  // return jwtExtractor(ctx.req);
}