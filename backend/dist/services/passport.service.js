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
        router[method](authentication_service_1.authConfig.oauth.google.path, 
        // (req, res, next) => passport.authenticate('jwt', { session: false }, (err, state, info) => {
        //   if (err) {
        //     next(err);
        //   }  
        //   if (state) {
        //     req.login(state, err => {
        //       if (err) {
        //         return next(err);
        //       }
        //       next(); 
        //     });
        //   } else {
        //     next();
        //   }
        // })(req, res, next),
        (req, res, next) => {
            const token = authService.getToken(req);
            passport_1.default.authenticate('google', {
                scope: ['email', 'profile'],
                state: token || undefined
            })(req, res, next);
        });
        router[method](authentication_service_1.authConfig.oauth.google.path + googleStrategyOpts.callbackURL, passport_1.default.authenticate('google'), (req, res, next) => {
            res.json(authService.getResponse(req.user));
        });
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
    const callbackURL = authentication_service_1.authConfig.basePath
        + authentication_service_1.authConfig.oauth.google.path
        + googleStrategyOpts.callbackURL;
    passport_1.default.use('google', new passport_google_oauth_1.OAuth2Strategy(Object.assign({}, googleStrategyOpts, { callbackURL, passReqToCallback: true }), async function (req, accessToken, refreshToken, profile, done) {
        try {
            if (!profile) {
                return done(null, false);
            }
            const googleInfo = normalizeProfile(profile);
            if (req.query.state) {
                const state = await authService.getAuthStateFromToken(req.query.state);
                const user = state.user;
                user.google = googleInfo; // for now just replace google profile without checking IDs
                await user.save();
                const deprecatedUser = await User.findOne({
                    'google.id': googleInfo.id
                });
                if (deprecatedUser) {
                    await deprecatedUser.remove();
                }
                done(null, state.user);
            }
            else {
                let user = await User.findOne({
                    'google.id': googleInfo.id
                });
                if (user) {
                    user.google = googleInfo;
                }
                else {
                    user = new User({
                        username: googleInfo.displayName,
                        google: googleInfo
                    });
                }
                await user.save();
                const session = await authService.createSession(user); // TODO: probably access/refresh tokens are essential in here to save
                done(null, {
                    session,
                    user
                });
            }
        }
        catch (err) {
            done(err);
        }
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
function normalizeProfile(profile) {
    let photos = profile.photos;
    const avatar = profile._json.image;
    const avatarIdx = photos.findIndex(photo => photo.url === avatar.value);
    photos = photos.map((photo, i) => {
        photo = {
            url: photo.value.split('?')[0],
            isProfile: false
        };
        if (avatarIdx === i) {
            photo.isProfile = true;
            photo.isDefault = avatar.isDefault;
        }
        return photo;
    });
    const emails = JSON.parse(JSON.stringify(profile._json.emails));
    const add = [];
    for (let i = 0; i < profile.emails.length; i++) {
        let j = emails.findIndex(email => email.value === profile.emails[i].value);
        if (j < 0) {
            add.push(i);
        }
    }
    for (let i of add) {
        emails.push(JSON.parse(JSON.stringify(profile.emails[i])));
    }
    return {
        id: profile.id,
        displayName: profile.displayName,
        name: profile.name,
        gender: profile.gender,
        emails,
        photos,
        profileUrl: profile._json.url,
        organizations: profile._json.organizations,
        placesLived: profile._json.placesLived,
        isPlusUser: profile._json.isPlusUser,
        circledByCount: profile._json.circledByCount,
        verified: profile._json.verified,
        domain: profile._json.domain
    };
}
//# sourceMappingURL=passport.service.js.map