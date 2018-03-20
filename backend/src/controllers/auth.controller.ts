import { Handler } from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import UserInitializer, { IUserModel } from '../models/user.model';
import { getService, IAuthenticationService, ClientError } from '../services/authentication.service';

let User: IUserModel;
let authService: IAuthenticationService;
let controller: IAuthController;

export interface IAuthController {
  register: Handler;
  issueToken: Handler;
  revokeToken: Handler;
}

export function getController(): IAuthController {
  if (controller) {
    return controller;
  }
  User = UserInitializer.getModel();
  authService = getService();
  controller = {
    register: handleError(async (ctx, next) => {
      if (ctx.isAuthenticated()) {
        throw new ClientError("User is logged in");
      }
      const user = await authService.createUser(ctx.request.body);
      const session = await authService.createSession(user);
      await authService.saveState(ctx, user, session);
      ctx.body = authService.getResponse(ctx);
      if (!ctx.body) {
        throw new Error("User is not logged in!");
      }
      await next();
    }),

    issueToken: handleError(async (ctx, next) => {
      if (ctx.isAuthenticated()) {
        throw new ClientError("User is logged in");
      }
      const state = await authService.getToken(ctx.request.body);
      await authService.saveState(ctx, state.user, state.session);
      ctx.body = authService.getResponse(ctx);
    }),

    revokeToken: handleError(async (ctx, next) => {
      await authService.logout(ctx);
      ctx.body = { //TODO: json schema
        "action": "logout",
        "status": "ok"
      };
      await next();
    })
  };

  return controller;
}

function handleError(middleware: Middleware): Middleware {
  return async (ctx: Context, next: () => Promise<any>) => {
    try {
      await middleware(ctx, next);
    } catch (err) {
      if (err instanceof ClientError) {
        ctx.throw(400, err);
      } else {
        ctx.throw(500, err);
      }
    }
  };
}