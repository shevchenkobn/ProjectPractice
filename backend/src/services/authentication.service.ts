import { Context } from 'koa';
import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken'
import UserInitializer from '../models/user.model';
import SessionInitializer from '../models/session.model';
import config from 'config';

export interface IAuthenticationService {
  getResponse(ctx: Context): any;
  createUser(object: any): Promise<mongoose.Document>;
  generateToken(user: mongoose.Document): string;
  createSession(token: string, user: mongoose.Document): Promise<mongoose.Document>;
} 

const secret = config.get<string>('jwtSecret');
let User: mongoose.Model<mongoose.Document> = null;
let Session: mongoose.Model<mongoose.Document> = null;

export let service: IAuthenticationService = null;

export function initialize(): IAuthenticationService {
  if (service) {
    return service;
  }
  User = UserInitializer.getModel();
  Session = SessionInitializer.getModel();
  service = {
    getResponse(ctx) {
      if (ctx.isAuthenticated()) {
        return ctx.state.user;
      } else {
        return null;
      }
    },

    generateToken(user) {
      if (user instanceof User) {
        const token = jwt.sign({
          id: (user as any)._id,
          date: Date.now()
        }, secret); //FIXME: investigate if any options are needed
        return token;
      } else {
        throw new Error('user is not a User model');
      }
    },

    async createSession(token, user) {
      if (user instanceof User && token.trim()) {
        const session = new Session({
          token,
          userId: new Schema.Types.ObjectId((user as any)._id)
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
      return new Promise<mongoose.Document>(async (resolve, reject) => {
        try {
          if (!(User as any).isRegistrable(object)) {
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