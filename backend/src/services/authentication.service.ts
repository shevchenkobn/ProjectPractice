import { Context } from 'koa';
import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken'
import UserInitializer, { IUserModel, IUserDocument } from '../models/user.model';
import SessionInitializer, { ISessionModel, ISessionDocument } from '../models/session.model';
import config from 'config';

export interface IState {
  user: IUserDocument;
  session: ISessionDocument
}

export interface IAuthenticationService {
  getResponse(ctx: Context): any; // TODO: json schema
  login(loginObject: any): Promise<IState>;
  saveState(ctx: Context, user: IUserDocument, session: ISessionDocument): Promise<void>;
  authenticate(ctx: Context, token: string): Promise<Context>;
  createUser(object: any): Promise<IUserDocument>;
  generateToken(user: IUserDocument): string;
  createSession(token: string, user: IUserDocument): Promise<ISessionDocument>;
  logout(ctx: Context, token?: string): Promise<void>;
} 

let _secret = config.get<string>('jwtSecret');
let User: IUserModel = null;
let Session: ISessionModel = null;

let service: IAuthenticationService = null;

export function getService(secret?: string): IAuthenticationService {
  if (service) {
    return service;
  }
  if (secret) {
    _secret = secret;
  }
  User = UserInitializer.getModel();
  Session = SessionInitializer.getModel();
  service = {
    getResponse(ctx) {
      if (ctx.isAuthenticated()) {
        return {
          token: ctx.state.session.token,
          user: ctx.state.user
        };
      } else {
        return null;
      }
    },

    async login(loginObject) {
      if (!User.isConstructionDoc(loginObject)) {
        throw "Bad login object";
      }
      const user = await User.findOne({
        username: loginObject.username
      });
      if (!(user && user.checkPassword(loginObject.password))) {
        throw "Bad username or password";
      }
      const token = service.generateToken(user);
      const session = await service.createSession(token, user);
      return {
        user,
        session
      };
    },

    async saveState(ctx, user, session) {
      await ctx.login(user);
      if (ctx.isUnauthenticated()) {
        throw new Error("Undefined login error");
      }
      ctx.state.session = session;
    },

    async authenticate(ctx, token) {
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

    generateToken(user) {
      if (user instanceof User) {
        const token = jwt.sign({
          id: user._id,
          date: Date.now()
        }, _secret); //FIXME: investigate if any options are needed
        return token;
      } else {
        throw new Error('user is not a User document');
      }
    },

    async createSession(token, user) {
      if (user instanceof User && token.trim()) {
        const session = new Session({
          token,
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
        token,
        status: 'active'
      });
      if (!session) {
        throw 'Invalid Token';
      }
      session.status = 'outdated';
      session.save();
      ctx.logout();
      ctx.state = {};
    }
  };
  return service;
}

function getToken(ctx: Context): string {
  const header = ctx.get('Authorization'); 
  if (!header) {
    throw 'No token found';
  }
  const parts = header.split(/\s+/);
  let i = 0;
  for (; !parts[i].length; i++);
  if (parts[i] !== 'Bearer') {
    throw 'Not a Bearer authentication';
  }
  return parts[i + 1];
}