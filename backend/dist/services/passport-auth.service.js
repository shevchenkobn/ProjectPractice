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
const koa_passport_1 = __importDefault(require("koa-passport"));
const passport_local_1 = require("passport-local");
const user_model_1 = __importDefault(require("../models/user.model"));
let User;
let initialized = false;
function initialize(userModel = user_model_1.default.getModel()) {
    if (initialized) {
        return koa_passport_1.default;
    }
    User = userModel;
    koa_passport_1.default.use('local', new passport_local_1.Strategy((username, password, done) => __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield User.findOne({ username });
            if (!user) {
                return done(null, false, new TypeError('Username is invalid'));
            }
            if (yield user.checkPassword(password)) {
                done(null, user);
            }
            else {
                done(null, false, new TypeError('Password is invalid'));
            }
        }
        catch (err) {
            done(err);
        }
    })));
    koa_passport_1.default.serializeUser((user, done) => {
        done(null, user._id);
    });
    koa_passport_1.default.deserializeUser((id, done) => __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield User.findById(id);
            done(null, user);
        }
        catch (err) {
            done(err);
        }
    }));
    initialized = true;
    return koa_passport_1.default;
}
exports.initialize = initialize;
//# sourceMappingURL=passport-auth.service.js.map