"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_service_1 = require("./../services/authentication.service");
const auth_controller_1 = require("./../controllers/auth.controller");
let readyRouter;
let controller;
function initialize() {
    if (readyRouter) {
        return readyRouter;
    }
    controller = auth_controller_1.getController();
    const router = express_1.Router();
    router.post(authentication_service_1.authConfig.basic.register, controller.register);
    router.post(authentication_service_1.authConfig.basic.issueToken, controller.issueToken);
    router.post(authentication_service_1.authConfig.basic.revokeToken, controller.revokeToken);
    readyRouter = {
        router,
        path: authentication_service_1.authConfig.basePath
    };
    return readyRouter;
}
exports.initialize = initialize;
//# sourceMappingURL=auth.route.js.map