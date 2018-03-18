"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        this.register = handleError((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            if (ctx.isAuthenticated()) {
                throw "User is logged in";
            }
            const user = yield authService.createUser(ctx.request.body);
            const token = authService.generateToken(user);
            const session = yield authService.createSession(token, user);
            yield authService.saveState(ctx, user, session);
            ctx.body = authService.getResponse(ctx);
            if (!ctx.body) {
                throw new Error("User is not logged in!");
            }
            yield next();
        }));
        this.login = handleError((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            if (ctx.isAuthenticated()) {
                throw "User is logged in";
            }
            const state = yield authService.login(ctx.request.body);
            yield authService.saveState(ctx, state.user, state.session);
            ctx.body = authService.getResponse(ctx);
        }));
        this.logout = handleError((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            yield authService.logout(ctx);
            ctx.body = {
                "action": "logout",
                "status": "ok"
            };
            yield next();
        }));
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
    return (ctx, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield middleware(ctx, next);
        }
        catch (err) {
            if (err instanceof Error) {
                ctx.throw(500, err);
            }
            else {
                ctx.throw(400, err);
            }
        }
    });
}
//# sourceMappingURL=auth.controller.js.map