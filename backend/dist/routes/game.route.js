"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const koa_passport_1 = __importDefault(require("koa-passport"));
const koa_router_1 = __importDefault(require("koa-router"));
let router;
function initialize() {
    if (router) {
        return router;
    }
    router = new koa_router_1.default({
        prefix: '/game'
    });
    router.get('/', (ctx, next) => koa_passport_1.default.authenticate('jwt', function (err, state, info, status) {
        if (err) {
            ctx.throw(500, err);
        }
        ctx.body = arguments;
    })(ctx, next));
    return router;
}
exports.initialize = initialize;
//# sourceMappingURL=game.route.js.map