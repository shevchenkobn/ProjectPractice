"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
const authentication_service_1 = require("../services/authentication.service");
let User;
let authService;
class AuthController {
    constructor() {
        this.register = handleError(async (ctx, next) => {
            if (ctx.isAuthenticated()) {
                throw "User is logged in";
            }
            const user = await authService.createUser(ctx.request.body);
            const session = await authService.createSession(user);
            await authService.saveState(ctx, user, session);
            ctx.body = authService.getResponse(ctx);
            if (!ctx.body) {
                throw new Error("User is not logged in!");
            }
            await next();
        });
        this.getToken = handleError(async (ctx, next) => {
            if (ctx.isAuthenticated()) {
                throw "User is logged in";
            }
            const state = await authService.getToken(ctx.request.body);
            await authService.saveState(ctx, state.user, state.session);
            ctx.body = authService.getResponse(ctx);
        });
        this.invalidateToken = handleError(async (ctx, next) => {
            await authService.logout(ctx);
            ctx.body = {
                "action": "logout",
                "status": "ok"
            };
            await next();
        });
        if (!User) {
            User = user_model_1.default.getModel();
        }
        if (!authService) {
            authService = authentication_service_1.getService();
        }
    }
}
exports.AuthController = AuthController;
function handleError(middleware) {
    return async (ctx, next) => {
        try {
            await middleware(ctx, next);
        }
        catch (err) {
            if (err instanceof Error) {
                ctx.throw(500, err);
            }
            else {
                ctx.throw(400, err);
            }
        }
    };
}
//# sourceMappingURL=auth.controller.js.map