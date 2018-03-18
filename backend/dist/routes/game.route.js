"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        return __awaiter(this, arguments, void 0, function* () {
            if (err) {
                ctx.throw(500, err);
            }
            yield ctx.login(state);
            ctx.body = arguments;
            next();
        });
    })(ctx, next));
    router.get('/g', (ctx, next) => koa_passport_1.default.authenticate('google', function () {
        return __awaiter(this, arguments, void 0, function* () {
            console.log(arguments);
            debugger;
        });
    })(ctx, next));
    return router;
}
exports.initialize = initialize;
//# sourceMappingURL=game.route.js.map