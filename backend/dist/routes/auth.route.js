"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const koa_router_1 = __importDefault(require("koa-router"));
const auth_controller_1 = require("../controllers/auth.controller");
let router;
let controller;
function initialize() {
    if (router) {
        return router;
    }
    router = new koa_router_1.default({
        prefix: '/auth'
    });
    controller = new auth_controller_1.AuthController();
    router.post('/', controller.login);
    router.post('/logout', controller.logout);
    router.post('/register', controller.register);
    return router;
}
exports.initialize = initialize;
//# sourceMappingURL=auth.route.js.map