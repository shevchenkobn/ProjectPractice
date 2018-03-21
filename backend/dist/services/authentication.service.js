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
const error_handler_service_1 = require("./error-handler.service");
class ClientAuthError extends error_handler_service_1.ClientRequestError {
}
exports.ClientAuthError = ClientAuthError;
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
        getResponse(req) {
            if (req.isAuthenticated()) {
                return {
                    token: service.generateToken(req.user.session),
                    user: req.user.user
                };
            }
            else {
                return null;
            }
        },
        async getToken(credentials) {
            if (!User.isConstructionDoc(credentials)) {
                throw new ClientAuthError("Bad login object");
            }
            const user = await User.findOne({
                username: credentials.username
            });
            if (!(user && user.checkPassword(credentials.password))) {
                throw new ClientAuthError("Bad username or password");
            }
            const session = await service.createSession(user);
            return {
                user,
                session
            };
        },
        getState(req) {
            return req.user;
        },
        async authenticate(sessionId) {
            if (!sessionId.trim()) {
                throw new Error("SessionId is empty");
            }
            const session = await Session.findOne({
                _id: sessionId,
                status: 'active'
            });
            if (!session) {
                throw new ClientAuthError("Invalid Token");
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
                        return reject(new ClientAuthError("Bad registration object"));
                    }
                    let user = await User.findOne({ username: object.username });
                    if (!user) {
                        user = new User(object);
                        await user.save();
                        resolve(user);
                    }
                    else {
                        reject(new ClientAuthError("Username is occupied"));
                    }
                }
                catch (err) {
                    reject(err);
                }
            });
        },
        async logout(req, token = '') {
            if (!token.trim()) {
                token = getToken(req);
            }
            const session = await Session.findOne({
                _id: jsonwebtoken_1.default.verify(token, _secret).id,
                status: 'active'
            });
            if (!session) {
                throw new ClientAuthError('Invalid Token');
            }
            session.status = 'outdated';
            await session.save();
            req.logout();
        }
    };
    return service;
}
exports.getService = getService;
function getToken(req) {
    return tokenExtractor(req);
}
//# sourceMappingURL=authentication.service.js.map