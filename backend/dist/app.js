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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_body_1 = __importDefault(require("koa-body"));
const swagger = __importStar(require("swagger2"));
const swagger2_koa_1 = require("swagger2-koa");
class App {
    constructor(routes, uploadDir, middlewares) {
        this._app = new koa_1.default();
        this._routers = routes;
        this._middlewares = middlewares;
        const koaBodyOptions = {
            multipart: true,
            urlencoded: true
        };
        if (uploadDir) {
            koaBodyOptions.formidable = { uploadDir };
        }
        this._app.use(koa_body_1.default(koaBodyOptions));
        if (middlewares) {
            for (let middleware of this._middlewares) {
                this._app.use(middleware);
            }
        }
        for (let route of this._routers) {
            this._app.use(route.routes());
        }
    }
    listen(port, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return this._app.listen(port, () => callback && callback(this._app));
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.App = App;
class SwaggerApp extends App {
    constructor(swaggerConfigPath, routes, uploadDir, middlewares) {
        const document = swagger.loadDocumentSync(swaggerConfigPath);
        if (!swagger.validateDocument(document)) {
            throw new TypeError(`${swaggerConfigPath} does not conform to the Swagger 2.0 schema`);
        }
        const validator = swagger2_koa_1.validate(document);
        if (middlewares) {
            middlewares.unshift(validator);
        }
        else {
            middlewares = [validator];
        }
        super(routes, uploadDir, middlewares);
        this._middlewares.shift();
        this._swaggerConfigPath = swaggerConfigPath;
        this._swaggerDocument = document;
        this._swaggerValidator = validator;
    }
}
exports.SwaggerApp = SwaggerApp;
//# sourceMappingURL=app.js.map