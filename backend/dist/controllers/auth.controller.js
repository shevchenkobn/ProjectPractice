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
class AuthController {
    constructor() {
        this.register = (ctx, next) => __awaiter(this, void 0, void 0, function* () {
            if (ctx.isAuthenticated()) {
                ctx.throw(400, "User is logged in");
            }
            try {
                const user = yield authentication_service_1.service.createUser(ctx.request.body);
                yield ctx.login(user);
                ctx.body = authentication_service_1.service.getResponse(ctx);
            }
            catch (err) {
                if (err instanceof Error) {
                    ctx.throw(500);
                }
                else {
                    ctx.throw(400, err);
                }
            }
            yield next();
        });
        this.login = (ctx, next) => __awaiter(this, void 0, void 0, function* () {
            if (ctx.isAuthenticated()) {
                ctx.throw(400, "User is logged in");
            }
            const user = yield User.findOne({ username: ctx.request.body.username });
            yield ctx.login(user);
            ctx.body = ctx.state.user;
        });
        this.logout = (ctx, next) => __awaiter(this, void 0, void 0, function* () {
            ctx.logout();
            ctx.body = {
                "action": "logout",
                "status": "ok"
            };
            yield next();
        });
        if (!User) {
            User = user_model_1.default.getModel();
        }
        if (!authentication_service_1.service) {
            authentication_service_1.initialize();
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map