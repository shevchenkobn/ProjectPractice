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
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const session_model_1 = __importDefault(require("../models/session.model"));
const config_1 = __importDefault(require("config"));
let _secret = config_1.default.get('jwtSecret');
let User = null;
let Session = null;
let service = null;
function getService(secret) {
    if (service) {
        return service;
    }
    if (secret) {
        _secret = secret;
    }
    User = user_model_1.default.getModel();
    Session = session_model_1.default.getModel();
    service = {
        getResponse(ctx) {
            if (ctx.isAuthenticated()) {
                return {
                    token: ctx.state.session.token,
                    user: ctx.state.user
                };
            }
            else {
                return null;
            }
        },
        login(loginObject) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!User.isConstructionDoc(loginObject)) {
                    throw "Bad login object";
                }
                const user = yield User.findOne({
                    username: loginObject.username
                });
                if (!(user && user.checkPassword(loginObject.password))) {
                    throw "Bad username or password";
                }
                const token = service.generateToken(user);
                const session = yield service.createSession(token, user);
                return {
                    user,
                    session
                };
            });
        },
        saveState(ctx, user, session) {
            return __awaiter(this, void 0, void 0, function* () {
                yield ctx.login(user);
                if (ctx.isUnauthenticated()) {
                    throw new Error("Undefined login error");
                }
                ctx.state.session = session;
            });
        },
        authenticate(ctx, token) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!(ctx && token)) {
                    throw new Error("ctx or token is empty");
                }
                const session = yield Session.findOne({
                    token,
                    status: 'active'
                });
                if (!session) {
                    throw "Invalid Token";
                }
                const user = yield User.findById(session.userId);
                if (!user) {
                    throw new Error("In-session user is not found!");
                }
                yield service.saveState(ctx, user, session);
                return ctx;
            });
        },
        generateToken(user) {
            if (user instanceof User) {
                const token = jsonwebtoken_1.default.sign({
                    id: user._id,
                    date: Date.now()
                }, _secret); //FIXME: investigate if any options are needed
                return token;
            }
            else {
                throw new Error('user is not a User document');
            }
        },
        createSession(token, user) {
            return __awaiter(this, void 0, void 0, function* () {
                if (user instanceof User && token.trim()) {
                    const session = new Session({
                        token,
                        userId: new mongoose_1.default.Types.ObjectId(user._id)
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
                    if (!User.isConstructionDoc(object)) {
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
        },
        logout(ctx, token = '') {
            return __awaiter(this, void 0, void 0, function* () {
                if (!token.trim()) {
                    token = getToken(ctx);
                }
                const session = yield Session.findOne({
                    token,
                    status: 'active'
                });
                if (!session) {
                    throw 'Invalid Token';
                }
                session.status = 'outdated';
                session.save();
                ctx.logout();
                ctx.state = {};
            });
        }
    };
    return service;
}
exports.getService = getService;
function getToken(ctx) {
    const header = ctx.get('Authorization');
    if (!header) {
        throw 'No token found';
    }
    const parts = header.split(/\s+/);
    let i = 0;
    for (; !parts[i].length; i++)
        ;
    if (parts[i] !== 'Bearer') {
        throw 'Not a Bearer authentication';
    }
    return parts[i + 1];
}
//# sourceMappingURL=authentication.service.js.map