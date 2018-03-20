"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const authentication_service_1 = require("./../services/authentication.service");
const auth_controller_1 = require("./../controllers/auth.controller");
const koa_router_1 = __importDefault(require("koa-router"));
let router;
let controller;
function initialize() {
    if (router) {
        return router;
    }
    controller = auth_controller_1.getController();
    router = new koa_router_1.default({
        prefix: authentication_service_1.authConfig.basePath
    });
    router.post(authentication_service_1.authConfig.basic.register, controller.register);
    router.post(authentication_service_1.authConfig.basic.issueToken, controller.issueToken);
    router.post(authentication_service_1.authConfig.basic.revokeToken, controller.revokeToken);
    return router;
}
exports.initialize = initialize;
//# sourceMappingURL=auth.route.js.map