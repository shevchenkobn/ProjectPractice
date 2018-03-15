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
    if (ctx.isAuthenticated()) {
      ctx.throw(400, "User is logged in");
    }
    let user = await this._userModel.findOne({username: ctx.request.body.username});
    if (!user) {
      user = new this._userModel(ctx.request.body);
      await user.save();
      await ctx.login(user);
      ctx.body = ctx.state.user;
    } else {
      ctx.throw(400, "Username is occupied");
    }
  }
  login: Middleware = async (ctx, next) => {
    if (ctx.isAuthenticated()) {
      ctx.throw(400, "User is logged in");
    }
    const user = await this._userModel.findOne({username: ctx.request.body.username});
    await ctx.login(user);
    ctx.body = ctx.state.user;
  }
  logout: Middleware = async (ctx, next) => {
    ctx.logout();
    ctx.body = {
      "action": "logout",
      "status": "ok"
    };
    await next();
  }
}