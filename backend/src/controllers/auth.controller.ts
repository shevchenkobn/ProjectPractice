import { Middleware, Context } from 'koa';
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

  register: Middleware = handleError(async (ctx, next) => {
    if (ctx.isAuthenticated()) {
      throw "User is logged in";
    }
    const user = await authService.createUser(ctx.request.body);
    const token = authService.generateToken(user);
    const session = await authService.createSession(token, user);
    await authService.saveState(ctx, user, session);
    ctx.body = authService.getResponse(ctx);
    if (!ctx.body) {
      throw new Error("User is not logged in!");
    }
    await next();
  })

  login: Middleware = handleError(async (ctx, next) => {
    if (ctx.isAuthenticated()) {
      throw "User is logged in";
    }
    const state = await authService.login(ctx.request.body);
    await authService.saveState(ctx, state.user, state.session);
    ctx.body = authService.getResponse(ctx);
  })

  logout: Middleware = handleError(async (ctx, next) => {
    await authService.logout(ctx);
    ctx.body = { //TODO: json schema
      "action": "logout",
      "status": "ok"
    };
    await next();
  })
}

function handleError(middleware: Middleware): Middleware {
  return async (ctx: Context, next: () => Promise<any>) => {
    try {
      await middleware(ctx, next);
    } catch (err) {
      if (err instanceof Error) {
        ctx.throw(500, err);
      } else {
        ctx.throw(400, err);
      }
    }
  };
}