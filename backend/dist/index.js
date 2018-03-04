"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const app = new koa_1.default();
const router = new koa_router_1.default();
const get = (ctx, next) => {
    ctx.body = "Hello, World";
};
const post = (ctx, next) => {
    ctx.body = "Post hello";
};
console.log("another");
router.get('/:name/:id([0-9]{0,5})', (ctx) => {
    ctx.body = ctx.params.name + ' with ' + ctx.params.id;
});
router.get('/hello', get);
router.post('/hello', post);
router.all('/test', (ctx, next) => {
    ctx.body = "all test";
});
app.use(router.routes())
    .listen(3000, () => {
    console.log('listening');
});
//# sourceMappingURL=index.js.map