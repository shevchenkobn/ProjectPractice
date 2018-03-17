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
const mongoose_1 = require("mongoose");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const session_model_1 = __importDefault(require("../models/session.model"));
const config_1 = __importDefault(require("config"));
const secret = config_1.default.get('jwtSecret');
let User = null;
let Session = null;
exports.service = null;
function initialize() {
    if (exports.service) {
        return exports.service;
    }
    User = user_model_1.default.getModel();
    Session = session_model_1.default.getModel();
    exports.service = {
        getResponse(ctx) {
            if (ctx.isAuthenticated()) {
                return ctx.state.user;
            }
            else {
                return null;
            }
        },
        generateToken(user) {
            if (user instanceof User) {
                const token = jsonwebtoken_1.default.sign({
                    id: user._id,
                    date: Date.now()
                }, secret); //FIXME: investigate if any options are needed
                return token;
            }
            else {
                throw new Error('user is not a User model');
            }
        },
        createSession(token, user) {
            return __awaiter(this, void 0, void 0, function* () {
                if (user instanceof User && token.trim()) {
                    const session = new Session({
                        token,
                        userId: new mongoose_1.Schema.Types.ObjectId(user._id)
                    });
                    yield session.save();
                    return session;
                }
                else {
                    throw new Error('user is not a model or token is empty');
                }
            });
        },
        /**
         * Rejects either with string (user error) or Error (server error)
         * @param object Object obtained from request
         */
        createUser(object) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (!User.isRegistrable(object)) {
                        return reject("Bad registration object");
                    }
                    let user = yield User.findOne({ username: object.username });
                    if (!user) {
                        user = new User(object);
                        yield user.save();
                        resolve(user);
                    }
                    else {
                        reject("Username is occupied");
                    }
                }
                catch (err) {
                    reject(err);
                }
            }));
        }
    };
    return exports.service;
}
exports.initialize = initialize;
//# sourceMappingURL=authentication.service.js.map