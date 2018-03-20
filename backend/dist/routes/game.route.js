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
    router.get('/', (ctx, next) => koa_passport_1.default.authenticate('jwt', async function (err, state, info, status) {
        if (err) {
            ctx.throw(500, err);
        }
        await ctx.login(state);
        ctx.body = arguments;
        next();
    })(ctx, next));
    router.get('/g', (ctx, next) => koa_passport_1.default.authenticate('google', async function () {
        console.log(arguments);
        debugger;
    })(ctx, next));
    router.get('/g/callback', (ctx, next) => koa_passport_1.default.authenticate('google', async function () {
        console.log(arguments);
        debugger;
    })(ctx, next));
    return router;
}
exports.initialize = initialize;
//# sourceMappingURL=game.route.js.map