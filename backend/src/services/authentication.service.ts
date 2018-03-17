import { Context } from 'koa';
import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken'
import UserInitializer, { IUserModel, IUserDocument } from '../models/user.model';
import SessionInitializer, { ISessionModel, ISessionDocument } from '../models/session.model';
import config from 'config';

export interface IAuthenticationService {
  getResponse(ctx: Context): any; // TODO: json schema
  login(loginObject: any): Promise<ISessionDocument>;
  authenticate(ctx: Context, token: string): Promise<Context>;
  createUser(object: any): Promise<IUserDocument>;
  generateToken(user: IUserDocument): string;
  createSession(token: string, user: IUserDocument): Promise<ISessionDocument>;
} 

const secret = config.get<string>('jwtSecret');
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
      const user = await User.findOne(loginObject.username);
      if (!(user && user.checkPassword(loginObject.password))) {
        throw "Bad username or password";
      }
      const token = service.generateToken(user);
      const session = await service.createSession(token, user);
      return session;
    },

    async authenticate(ctx, token) {
      if (!(ctx && token)) {
        throw new Error("ctx or token is empty");
      }
      const session = await Session.findOne({token});
      if (!session) {
        throw "Invalid Token";
      }
      const user = await User.findById(session.userId);
      if (!user) {
        throw new Error("In-session user is not found!");
      }
      await ctx.login(user);
      if (!ctx.isAuthenticated()) {
        throw new Error("Undefined login error");
      }
      ctx.state.session = session;
      return ctx;
    },

    generateToken(user) {
      if (user instanceof User) {
        const token = jwt.sign({
          id: user._id,
          date: Date.now()
        }, secret); //FIXME: investigate if any options are needed
        return token;
      } else {
        throw new Error('user is not a User document');
      }
    },

    async createSession(token, user) {
      if (user instanceof User && token.trim()) {
        const session = new Session({
          token,
          userId: new Schema.Types.ObjectId(user._id)
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
    }
  };
  return service;
}