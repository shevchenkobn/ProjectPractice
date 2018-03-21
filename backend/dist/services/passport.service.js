"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const passport_google_oauth_1 = require("passport-google-oauth");
const user_model_1 = __importDefault(require("../models/user.model"));
const authentication_service_1 = require("./authentication.service");
const session_model_1 = __importDefault(require("../models/session.model"));
let User;
let Session;
let initialized = false;
let authService;
let googleOauthOptions;
function initialize(userModel = user_model_1.default.getModel()) {
    if (initialized) {
        return passport_1.default;
    }
    User = userModel;
    Session = session_model_1.default.getModel();
    authService = authentication_service_1.getService();
    googleOauthOptions = authentication_service_1.authConfig.oauth.google.strategyOptions;
    passport_1.default.use('jwt', new passport_jwt_1.Strategy({
        secretOrKey: authentication_service_1.authConfig.jwtSecret,
        jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
        session: false
    }, async (jwtPayload, done) => {
        try {
            const state = await authService.authenticate(jwtPayload.id);
            done(null, state);
        }
        catch (err) {
            if (err instanceof authentication_service_1.ClientAuthError) {
                done(null, false, err);
            }
            else {
                done(err);
            }
        }
    }));
    passport_1.default.use('google', new passport_google_oauth_1.OAuth2Strategy(googleOauthOptions, function (accessToken, refreshToken, profile, done) {
        console.log(arguments);
        debugger;
    }));
    /**
     * The thing about passport that sucks is mandatory session making
     */
    passport_1.default.serializeUser((user, done) => {
        done(null, 1);
    });
    passport_1.default.deserializeUser((id, done) => {
        done(null, 1);
    });
    initialized = true;
    return passport_1.default;
}
exports.initialize = initialize;
//# sourceMappingURL=passport.service.js.map