"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const session_model_1 = __importDefault(require("../models/session.model"));
const config_1 = __importDefault(require("config"));
const passport_jwt_1 = require("passport-jwt");
const error_handler_service_1 = require("./error-handler.service");
const game_controller_1 = require("../socketio-api/controllers/game.controller");
const bson_1 = require("bson");
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
            const payload = session.toObject();
            return jsonwebtoken_1.default.sign(payload, _secret);
        },
        async getSessionFromToken(token) {
            let decoded;
            try {
                decoded = jsonwebtoken_1.default.verify(token, _secret);
            }
            catch (err) {
                throw new error_handler_service_1.AccessError('Invalid token');
            }
            return await service.authenticate(decoded.id);
        },
        getResponse(session) {
            if (!(session.user instanceof User)) {
                throw new TypeError('Session is not populated with user');
            }
            return {
                token: service.generateToken(session),
                user: session.user
            };
        },
        async getNewSession(credentials) {
            if (!User.isConstructionObject(credentials)) {
                throw new ClientAuthError("Bad login object");
            }
            const user = await User.findOne({
                username: credentials.username
            });
            if (!(user && await user.checkPassword(credentials.password))) {
                throw new ClientAuthError("Bad username or password");
            }
            return await service.createSession(user);
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
            if (+session.updatedAt + exports.authConfig.sessionLifespan <= Date.now()) {
                await revokeSession(session);
                throw new ClientAuthError("Session is outdated");
            }
            session.updatedAt = new Date();
            await session.save();
            await session.populate('user').execPopulate();
            return session;
        },
        async createSession(user) {
            const sessions = (await Session.find({
                user: user._id,
                status: 'active'
            })).filter(async (session) => {
                if (+session.updatedAt + exports.authConfig.sessionLifespan <= Date.now()) {
                    revokeSession(session).then(session => {
                        //TODO: add some logging here
                    }).catch(err => {
                        //TODO: add some logging here
                    });
                    return false;
                }
                return true;
            });
            if (user instanceof User) {
                if (sessions.length >= exports.authConfig.sessionLimit) {
                    throw new ClientAuthError(`Maximum number of tokens (${exports.authConfig.sessionLimit}) has already been issued!`);
                }
                const session = new Session({
                    user: user._id
                });
                await session.save();
                await session.populate('user').execPopulate();
                return session;
            }
            else {
                throw new Error('user is not a model');
            }
        },
        /**
         * Rejects either with string (user error) or Error (server error)
         * @param object Object obtained from request
         */
        createUser(object) {
            return new Promise(async (resolve, reject) => {
                try {
                    if (!User.isConstructionObject(object)) {
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
        async revokeToken(req, token = '') {
            if (token === true) {
                token = service.getToken(req, token);
            }
            else if (typeof token === 'string') {
                if (token = !token.trim()) {
                    token = service.getToken(req);
                }
            }
            if (!token) {
                throw new ClientAuthError('Authorization token must be provided either in body or in "Authorization" header');
            }
            const session = await Session.findOne({
                _id: jsonwebtoken_1.default.verify(token, _secret).id,
                status: 'active'
            });
            if (!session) {
                throw new ClientAuthError('Invalid Token');
            }
            await revokeSession(session);
            req.logout();
        },
        getToken(req, fromBody = false) {
            return fromBody && req.body && req.body.token && (req.body.token + '').trim() || tokenExtractor(req);
        },
        async swaggerBearerJwtChecker(req, authOrSecDef, scopesOrApiKey, callback) {
            try {
                const token = service.getToken(req);
                if (!token || typeof token === 'string' && !token.trim()) {
                    return callback(new error_handler_service_1.AccessError('Access token must be provided'));
                }
                const session = await service.getSessionFromToken(token);
                req.login(session, err => {
                    if (err)
                        callback(err);
                    callback();
                });
            }
            catch (err) {
                callback(err);
            }
        }
    };
    return service;
}
exports.getService = getService;
async function revokeSession(session) {
    session.status = 'outdated';
    if (session.game) {
        game_controller_1.disconnectUser(session.user instanceof bson_1.ObjectID ? session.user.toHexString() : session.user.id);
    }
    await session.save();
    return session;
}
//# sourceMappingURL=authentication.service.js.map