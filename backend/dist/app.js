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
const swagger = __importStar(require("swagger2"));
const swagger2_koa_1 = require("swagger2-koa");
class BaseApp {
    constructor(app) {
        if (!app) {
            throw new TypeError('app must be an object');
        }
        this._app = app;
    }
    listen(port, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return this._app.listen(port, callback);
            }
            catch (err) {
                return err;
            }
        });
    }
}
exports.BaseApp = BaseApp;
class App extends BaseApp {
    constructor(routes) {
        super(new koa_1.default());
        this._routers = routes;
        for (let route of this._routers) {
            this._app.use(route.routes());
        }
    }
}
exports.App = App;
class SwaggerApp extends BaseApp {
    constructor(swaggerConfigPath) {
        const document = swagger.loadDocumentSync(swaggerConfigPath);
        const router = swagger2_koa_1.router(document);
        super(router.app());
        this._swaggerConfigPath = swaggerConfigPath;
        this._swaggerDocument = document;
        this._swaggerRouter = router;
    }
}
exports.SwaggerApp = SwaggerApp;
//# sourceMappingURL=app.js.map