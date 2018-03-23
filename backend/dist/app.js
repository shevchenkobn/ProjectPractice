"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const multer_1 = __importDefault(require("multer"));
const events_1 = require("events");
const swagger_tools_1 = __importDefault(require("swagger-tools"));
const swagger_service_1 = require("./services/swagger.service");
class App {
    constructor(middlewares, uploadDir, routes = []) {
        this._app = express_1.default();
        this._routers = routes;
        this._middlewares = middlewares;
        this._app.use(body_parser_1.default.urlencoded({
            extended: true
        }), body_parser_1.default.json(), body_parser_1.default.raw());
        if (uploadDir) {
            this._app.use(multer_1.default({
                dest: uploadDir
            }).any());
        }
        this.useMiddlewares(this._middlewares.before);
        for (let router of this._routers) {
            this._app.use(router.path, router.router);
        }
    }
    useMiddlewares(middlewares) {
        if (middlewares && middlewares.length) {
            for (let middleware of middlewares) {
                this._app.use(middleware);
            }
        }
    }
    listen(port, callback) {
        if (!this._middlewaresInUse) {
            this.useMiddlewares(this._middlewares.after);
            this._middlewaresInUse = true;
        }
        return Promise.resolve(this._app.listen(port, () => callback && callback(this._app)));
    }
}
exports.App = App;
class SwaggerApp extends App {
    //constructor(swaggerConfigPath: string, middlewares: IHandlersArray, uploadDir?: string, routes: Array<IReadyRouter> = []) {
    constructor(config) {
        super(config.middlewares, config.uploadDir, config.routes);
        this._initializingSwagger = false;
        this._eventEmitter = new events_1.EventEmitter();
        this._listenTasks = [];
        this._swaggerConfig = config.swagger;
        this._swaggerDocument = swagger_service_1.loadSwaggerDocument(this._swaggerConfig.filepath);
        this._initializingSwagger = true;
        swagger_tools_1.default.initializeMiddleware(this._swaggerDocument, middleware => {
            this._app.use(middleware.swaggerMetadata());
            if (this._swaggerConfig.securityOptions) {
                this._app.use(middleware.swaggerSecurity(this._swaggerConfig.securityOptions));
            }
            this._app.use(middleware.swaggerValidator(this._swaggerConfig.validatorOptions));
            this._app.use(middleware.swaggerRouter(this._swaggerConfig.routerOptions));
            if (this._swaggerConfig.uiOptions) {
                this._app.use(middleware.swaggerUi(this._swaggerConfig.uiOptions));
            }
            this.executeTasks();
        });
    }
    executeTasks() {
        this._initializingSwagger = false;
        this._eventEmitter.emit('init');
        this._listenTasks.length = 0;
    }
    listen(port, callback) {
        const promise = new Promise((resolve, reject) => {
            if (this._initializingSwagger) {
                this._eventEmitter.on('init', () => super.listen(port, callback).then(resolve));
            }
            else {
                super.listen(port, callback).then(resolve);
            }
        });
        if (this._initializingSwagger) {
            this._listenTasks.push(promise);
        }
        return promise;
    }
}
exports.SwaggerApp = SwaggerApp;
//# sourceMappingURL=app.js.map