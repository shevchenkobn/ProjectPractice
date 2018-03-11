"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const koa_router_1 = __importDefault(require("koa-router"));
const auth_controller_1 = require("../controllers/auth.controller");
const router = new koa_router_1.default({
    prefix: '/auth'
});
const controller = new auth_controller_1.AuthController();
router.post('/', controller.login);
router.get('/logout', controller.logout);
router.post('/register', controller.register);
exports.default = router;
//# sourceMappingURL=auth.route.js.map