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
const passport_auth_service_1 = __importDefault(require("../services/passport-auth.service"));
const user_model_1 = require("../models/user.model");
const User = user_model_1.getUserModel();
class AuthController {
    constructor() {
        this.register = (ctx, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                let user = yield User.findOne({ username: ctx.request.body.username });
                if (!user) {
                    user = new User(ctx.request.body);
                    yield user.save();
                }
                yield ctx.login(user);
            }
            catch (err) {
                ctx.app.emit('error', err, ctx);
            }
        });
        this.login = passport_auth_service_1.default.authenticate('local', {});
        this.logout = (ctx, next) => {
            ctx.logout();
            next();
        };
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map