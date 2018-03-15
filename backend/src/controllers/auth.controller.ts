import { Middleware } from 'koa';
import mongoose from 'mongoose';
import passport from 'passport';
import UserInitializer from '../models/user.model';

export class AuthController {
  private readonly _userModel: mongoose.Model<mongoose.Document>;

  constructor() {
    this._userModel = UserInitializer.getModel();
  }
  register: Middleware = async (ctx, next) => {
    let user = await this._userModel.findOne({username: ctx.request.body.username});
    if (!user) {
      user = new this._userModel(ctx.request.body);
      await user.save();
    } else {
      ctx.throw(400, "Username is occupied");
    }
  }
  login: Middleware = async (ctx, next) => {
    const user = await this._userModel.findOne({username: ctx.request.body.username});
    await ctx.login(user);
  }
  logout: Middleware = (ctx, next) => {
    ctx.logout();
    next();
  }
}