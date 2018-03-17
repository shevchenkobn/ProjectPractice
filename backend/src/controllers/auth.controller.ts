import { Middleware } from 'koa';
import mongoose from 'mongoose';
import passport from 'passport';
import UserInitializer, { IUserModel } from '../models/user.model';
import { getService, IAuthenticationService } from '../services/authentication.service';

let User: IUserModel;
let authService: IAuthenticationService
export class AuthController {
  constructor() {
    if (!User) {
      User = UserInitializer.getModel();
    }
    if (!authService) {
      authService = getService();
    }
  }

  register: Middleware = async (ctx, next) => {
    if (ctx.isAuthenticated()) {
      ctx.throw(400, "User is logged in");
    }
    try {
      const user = await authService.createUser(ctx.request.body);
      await ctx.login(user);
      ctx.body = authService.getResponse(ctx);
    } catch (err) {
      if (err instanceof Error) {
        ctx.throw(500);
      } else {
        ctx.throw(400, err);
      }
    }
    await next();
  }

  login: Middleware = async (ctx, next) => {
    if (ctx.isAuthenticated()) {
      ctx.throw(400, "User is logged in");
    }
    const user = await User.findOne({username: ctx.request.body.username});
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