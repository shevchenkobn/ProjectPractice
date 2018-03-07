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
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const koa_body_1 = __importDefault(require("koa-body"));
const path_1 = __importDefault(require("path"));
const app = new koa_1.default();
const router = new koa_router_1.default();
const uploadPath = path_1.default.resolve(__dirname, '../uploads');
const bodyParser = koa_body_1.default({
    formidable: { uploadDir: uploadPath },
    multipart: true,
    urlencoded: true
});
router.all('/test', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    ctx.body = "all test";
    next();
})).all('/not_found', (ctx, next) => {
    ctx.body = "sorry, not fjou";
}).all('/error', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        // throw new Error('oh shi-');
    }
    catch (err) {
        ctx.throw('Msg', 500);
        // ctx.status = err.status || 500;
        // ctx.body = err.message;
        // ctx.app.emit('error', err, ctx);
    }
    next();
})).post('/form', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    console.log(ctx.request.body);
    ctx.body = ctx.request.body;
}));
app
    .use(bodyParser)
    .use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
}))
    .use(router.routes())
    .use((ctx, next) => {
    if (ctx.status !== 404)
        return;
    ctx.redirect('/not_found');
})
    .listen(3000, () => {
    console.log('listening');
});
//# sourceMappingURL=index.js.map