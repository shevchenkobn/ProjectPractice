import { Handler } from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import UserInitializer, { IUserModel } from '../models/user.model';
import { getService, IAuthenticationService, ClientAuthError } from '../services/authentication.service';

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
    register: async (req, res, next) => {
      if (req.isAuthenticated()) {
        next(new ClientAuthError("User is logged in"));
      }
      try {
        const user = await authService.createUser(req.body);
        const session = await authService.createSession(user);
        req.login({ user, session }, err => {
          if (err) {
            next(err);
          }
          res.json(authService.getResponse(<any>req.user));
        });
      } catch (err) {
        next(err);
      }
    },

    issueToken: async (req, res, next) => {
      if (req.isAuthenticated()) {
        next(new ClientAuthError("User is logged in"));
      }
      try {
        const state = await authService.getAuthState(req.body);
        req.login(state, err => {
          if (err) {
            next(err);
          }
          res.json(authService.getResponse(<any>req.user));
        });
      } catch (err) {
        next(err);
      }
    },

    revokeToken: (req, res, next) => {
      authService.revokeToken(req).then(() => {
        res.json({ //TODO: json schema
          "action": "logout",
          "status": "ok"
        });
      }).catch(next);
    }
  };

  return controller;
}