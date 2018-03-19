"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const auth_controller_1 = require("./../controllers/auth.controller");
const koa_router_1 = __importDefault(require("koa-router"));
const config_1 = __importDefault(require("config"));
const paths = config_1.default.get('auth');
let router;
let controller;
function initialize() {
    if (router) {
        return router;
    }
    controller = auth_controller_1.getController();
    router = new koa_router_1.default({
        prefix: paths.basePath
    });
    router.post(paths.basic.register, controller.register);
    router.post(paths.basic.issueToken, controller.issueToken);
    router.post(paths.basic.revokeToken, controller.revokeToken);
    return router;
}
exports.initialize = initialize;
//# sourceMappingURL=auth.route.js.map