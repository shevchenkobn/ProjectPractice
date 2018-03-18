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
const passport_jwt_1 = require("passport-jwt");
const passport_google_oauth_1 = require("passport-google-oauth");
const user_model_1 = __importDefault(require("../models/user.model"));
const authentication_service_1 = require("./authentication.service");
const config_1 = __importDefault(require("config"));
const session_model_1 = __importDefault(require("../models/session.model"));
let User;
let Session;
let initialized = false;
let authService;
let googleOauthOptions;
function initialize(userModel = user_model_1.default.getModel()) {
    if (initialized) {
        return koa_passport_1.default;
    }
    User = userModel;
    Session = session_model_1.default.getModel();
    authService = authentication_service_1.getService();
    googleOauthOptions = config_1.default.get('auth.oauth.google.strategyOptions');
    koa_passport_1.default.use('jwt', new passport_jwt_1.Strategy({
        secretOrKey: config_1.default.get('auth.jwtSecret'),
        jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken()
    }, (jwtPayload, done) => __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield Session.findOne({
                _id: jwtPayload.id,
                status: 'active'
            });
            if (!session) {
                return done(null, false, 'Invalid Token');
            }
            const user = yield User.findById(session.userId);
            if (!user) {
                throw new Error('Non-existing user');
            }
            done(null, {
                user,
                session
            });
        }
        catch (err) {
            done(err);
        }
    })));
    koa_passport_1.default.use('google', new passport_google_oauth_1.OAuth2Strategy(googleOauthOptions, function (accessToken, refreshToken, profile, done) {
        console.log(arguments);
        debugger;
    }));
    /**
     * The thing about passport that sucks is mandatory session making
     */
    koa_passport_1.default.serializeUser((user, done) => {
        done(null, 1);
    });
    koa_passport_1.default.deserializeUser((id, done) => {
        done(null, 1);
    });
    initialized = true;
    return koa_passport_1.default;
}
exports.initialize = initialize;
//# sourceMappingURL=passport.service.js.map