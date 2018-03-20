"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const session_model_1 = __importDefault(require("../models/session.model"));
const config_1 = __importDefault(require("config"));
const passport_jwt_1 = require("passport-jwt");
class ClientError extends Error {
}
exports.ClientError = ClientError;
exports.authConfig = config_1.default.get('auth');
let _secret = exports.authConfig.jwtSecret;
let tokenExtractor;
let User = null;
let Session = null;
let service = null;
function getService() {
    if (service) {
        return service;
    }
    User = user_model_1.default.getModel();
    Session = session_model_1.default.getModel();
    tokenExtractor = passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken();
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
        async getToken(credentials) {
            if (!User.isConstructionDoc(credentials)) {
                throw new ClientError("Bad login object");
            }
            const user = await User.findOne({
                username: credentials.username
            });
            if (!(user && user.checkPassword(credentials.password))) {
                throw new ClientError("Bad username or password");
            }
            const session = await service.createSession(user);
            return {
                user,
                session
            };
        },
        async saveState(ctx, user, session) {
            await ctx.login({ user, session });
        },
        getState(ctx) {
            return ctx.state.user;
        },
        async authenticate(token) {
            if (!token.trim()) {
                throw new Error("ctx or token is empty");
            }
            const session = await Session.findOne({
                token,
                status: 'active'
            });
            if (!session) {
                throw new ClientError("Invalid Token");
            }
            const user = await User.findById(session.userId);
            return {
                user,
                session
            };
        },
        async createSession(user) {
            if (user instanceof User) {
                const session = new Session({
                    userId: new mongoose_1.default.Types.ObjectId(user._id)
                });
                await session.save();
                return session;
            }
            else {
                throw new Error('user is not a model or token is empty');
            }
        },
        /**
         * Rejects either with string (user error) or Error (server error)
         * @param object Object obtained from request
         */
        createUser(object) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (!User.isConstructionDoc(object)) {
                        return reject(new ClientError("Bad registration object"));
                    }
                    let user = await User.findOne({ username: object.username });
                    if (!user) {
                        user = new User(object);
                        await user.save();
                        resolve(user);
                    }
                    else {
                        reject(new ClientError("Username is occupied"));
                    }
                }
                catch (err) {
                    reject(err);
                }
            });
        },
        async logout(ctx, token = '') {
            if (!token.trim()) {
                token = getToken(ctx);
            }
            const session = await Session.findOne({
                _id: jsonwebtoken_1.default.verify(token, _secret).id,
                status: 'active'
            });
            if (!session) {
                throw new ClientError('Invalid Token');
            }
            session.status = 'outdated';
            await session.save();
            ctx.logout();
        }
    };
    return service;
}
exports.getService = getService;
// const jwtExtractor = ExtractJwt.fromAuthHeaderAsBearerToken();
function getToken(ctx) {
    // const header = ctx.get('Authorization'); 
    // if (!header.trim()) {
    //   if (typeof ctx.request.body === 'object' && ctx.request.body &&
    //     typeof ctx.request.body.token === 'string' && ctx.request.body.token.trim()) {
    //     return ctx.request.body.token.trim();
    //   } else {
    //     throw new ClientError('No token found');
    //   }
    // }
    // const parts = header.split(/\s+/);
    // let i = 0;
    // for (; !parts[i].length; i++);
    // if (parts[i].toLocaleLowerCase() !== 'bearer') {
    //   throw 'Not a Bearer authentication';
    // }
    // return parts[i + 1];
    return tokenExtractor(ctx.req);
}
//# sourceMappingURL=authentication.service.js.map