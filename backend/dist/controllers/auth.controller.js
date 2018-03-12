"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../models/user.model");
const User = user_model_1.getUserModel();
class AuthController {
    constructor() {
        this.register = (ctx, next) => __awaiter(this, void 0, void 0, function* () {
            let user = yield User.findOne({ username: ctx.request.body.username });
            if (!user) {
                user = new User(ctx.request.body);
                yield user.save();
            }
            else {
                ctx.throw(400, "Username is occupied");
            }
        });
        this.login = (ctx, next) => __awaiter(this, void 0, void 0, function* () {
            const user = yield User.findOne({ username: ctx.request.body.username });
            yield ctx.login(user);
        });
        this.logout = (ctx, next) => {
            ctx.logout();
            next();
        };
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map