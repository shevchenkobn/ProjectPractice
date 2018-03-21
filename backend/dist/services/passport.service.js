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
let googleStrategyOpts;
let googleInited = false;
const middlewares = {
    jwtAuthenticate(req, res, next) {
        passport_1.default.authenticate('jwt', { session: false }, function (err, state, info) {
            if (err) {
                next(err);
            }
            if (!state) {
                next(info);
            }
            req.login(state, next);
        })(req, res, next);
    },
    addGoogleLogin(router, method = 'get') {
        if (googleInited) {
            throw new Error('Google authentication is already implemented');
        }
        router[method](authentication_service_1.authConfig.oauth.google.path, passport_1.default.authenticate('google', {
            scope: [
                'https://www.googleapis.com/auth/plus.login',
                'https://www.googleapis.com/auth/plus.profile.emails.read'
            ]
        }), async function () {
            console.log(arguments);
            debugger;
        });
        router[method](authentication_service_1.authConfig.oauth.google.path + googleStrategyOpts.callbackURL, passport_1.default.authenticate('google', async function () {
            console.log(arguments);
            debugger;
        }));
        return router;
    }
};
function initialize(userModel = user_model_1.default.getModel()) {
    if (initialized) {
        return passport_1.default;
    }
    User = userModel;
    Session = session_model_1.default.getModel();
    authService = authentication_service_1.getService();
    googleStrategyOpts = JSON.parse(JSON.stringify(authentication_service_1.authConfig.oauth.google.strategyOptions));
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
    googleStrategyOpts.callbackURL = authentication_service_1.authConfig.basePath
        + authentication_service_1.authConfig.oauth.google.path
        + googleStrategyOpts.callbackURL;
    passport_1.default.use('google', new passport_google_oauth_1.OAuth2Strategy(googleStrategyOpts, function (accessToken, refreshToken, profile, done) {
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
function getMiddlewares() {
    if (!initialized) {
        throw new Error('Passport service is uninitialized');
    }
    return middlewares;
}
exports.getMiddlewares = getMiddlewares;
//# sourceMappingURL=passport.service.js.map