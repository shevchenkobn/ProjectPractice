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
let _secret = config_1.default.get('auth.jwtSecret');
let User = null;
let Session = null;
let service = null;
function getService() {
    if (service) {
        return service;
    }
    User = user_model_1.default.getModel();
    Session = session_model_1.default.getModel();
    service = {
        generateToken(session) {
            const payload = {
                id: session.id
            };
            return jsonwebtoken_1.default.sign(payload, _secret);
        },
        getResponse(ctx) {
            if (ctx.isAuthenticated()) {
                return {
                    token: service.generateToken(ctx.state.user.session),
                    user: ctx.state.user.user
                };
            }
            else {
                return null;
            }
        },
        getToken(credentials) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!User.isConstructionDoc(credentials)) {
                    throw "Bad login object";
                }
                const user = yield User.findOne({
                    username: credentials.username
                });
                if (!(user && user.checkPassword(credentials.password))) {
                    throw "Bad username or password";
                }
                const session = yield service.createSession(user);
                return {
                    user,
                    session
                };
            });
        },
        saveState(ctx, user, session) {
            return __awaiter(this, void 0, void 0, function* () {
                yield ctx.login({ user, session });
                if (ctx.isUnauthenticated()) {
                    throw new Error("Undefined login error");
                }
            });
        },
        getState(ctx) {
            return ctx.state.user;
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
        createSession(user) {
            return __awaiter(this, void 0, void 0, function* () {
                if (user instanceof User) {
                    const session = new Session({
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
                    _id: jsonwebtoken_1.default.verify(token, _secret).id,
                    status: 'active'
                });
                if (!session) {
                    throw 'Invalid Token';
                }
                session.status = 'outdated';
                yield session.save();
                ctx.logout();
            });
        }
    };
    return service;
}
exports.getService = getService;
// const jwtExtractor = ExtractJwt.fromAuthHeaderAsBearerToken();
function getToken(ctx) {
    const header = ctx.get('Authorization');
    if (!header.trim()) {
        if (typeof ctx.request.body === 'object' && ctx.request.body &&
            typeof ctx.request.body.token === 'string' && ctx.request.body.token.trim()) {
            return ctx.request.body.token.trim();
        }
        else {
            throw 'No token found';
        }
    }
    const parts = header.split(/\s+/);
    let i = 0;
    for (; !parts[i].length; i++)
        ;
    if (parts[i].toLocaleLowerCase() !== 'bearer') {
        throw 'Not a Bearer authentication';
    }
    return parts[i + 1];
    // return jwtExtractor(ctx.req);
}
//# sourceMappingURL=authentication.service.js.map