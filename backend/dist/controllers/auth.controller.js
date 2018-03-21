"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
const authentication_service_1 = require("../services/authentication.service");
let User;
let authService;
let controller;
function getController() {
    if (controller) {
        return controller;
    }
    User = user_model_1.default.getModel();
    authService = authentication_service_1.getService();
    controller = {
        register: async (req, res, next) => {
            if (req.isAuthenticated()) {
                next(new authentication_service_1.ClientAuthError("User is logged in"));
            }
            try {
                const user = await authService.createUser(req.body);
                const session = await authService.createSession(user);
                req.login({ user, session }, err => {
                    if (err) {
                        next(err);
                    }
                    res.json(req.user);
                });
            }
            catch (err) {
                next(err);
            }
        },
        issueToken: async (req, res, next) => {
            if (req.isAuthenticated()) {
                next(new authentication_service_1.ClientAuthError("User is logged in"));
            }
            try {
                const state = await authService.getToken(req.body);
                req.login(state, err => {
                    if (err) {
                        next(err);
                    }
                    res.json(req.user);
                });
            }
            catch (err) {
                next(err);
            }
        },
        revokeToken: (req, res, next) => {
            authService.logout(req).then(() => {
                res.json({
                    "action": "logout",
                    "status": "ok"
                });
            }).catch(next);
        }
    };
    return controller;
}
exports.getController = getController;
//# sourceMappingURL=auth.controller.js.map