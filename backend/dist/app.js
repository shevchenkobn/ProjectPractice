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
const koa_body_1 = __importDefault(require("koa-body"));
const koa_session_1 = __importDefault(require("koa-session"));
const swagger2_koa_1 = require("swagger2-koa");
const swagger_service_1 = require("./services/swagger.service");
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
        this._app.use(koa_session_1.default({}, this._app));
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
        const document = swagger_service_1.loadSwaggerDocument(swaggerConfigPath);
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