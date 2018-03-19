"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
const authentication_service_1 = require("../services/authentication.service");
let User;
let authService;
let controller;
function getController() {
    if (controller) {
        return controller;
    }
    User = user_model_1.default.getModel();
    authService = authentication_service_1.getService();
    controller = {
        register: handleError(async (ctx, next) => {
            if (ctx.isAuthenticated()) {
                throw new authentication_service_1.ClientError("User is logged in");
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
                throw new authentication_service_1.ClientError("User is logged in");
            }
            const state = await authService.getToken(ctx.request.body);
            await authService.saveState(ctx, state.user, state.session);
            ctx.body = authService.getResponse(ctx);
        }),
        revokeToken: handleError(async (ctx, next) => {
            await authService.logout(ctx);
            ctx.body = {
                "action": "logout",
                "status": "ok"
            };
            await next();
        })
    };
    return controller;
}
exports.getController = getController;
function handleError(middleware) {
    return async (ctx, next) => {
        try {
            await middleware(ctx, next);
        }
        catch (err) {
            if (err instanceof authentication_service_1.ClientError) {
                ctx.throw(400, err);
            }
            else {
                ctx.throw(500, err);
            }
        }
    };
}
//# sourceMappingURL=auth.controller.js.map