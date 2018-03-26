"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const events_1 = require("events");
const socket_io_1 = __importDefault(require("socket.io"));
const path_1 = __importDefault(require("path"));
const swagger_tools_1 = __importDefault(require("swagger-tools"));
const swagger_service_1 = require("./services/swagger.service");
class App {
    constructor(config) {
        this._app = express_1.default();
        this._expressConfig = config.express;
        if (!this._expressConfig.middlewares) {
            this._expressConfig.middlewares = {
                before: [],
                after: []
            };
        }
        if (this._expressConfig.routes) {
            this._expressConfig.routes = [];
        }
        this._app.use(body_parser_1.default.urlencoded({
            extended: true
        }), body_parser_1.default.json(), body_parser_1.default.raw(), cors_1.default());
        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
            this._app.use('/debug', (req, res, next) => {
                res.sendFile(path_1.default.resolve(__dirname, '../debug/index.html'));
            });
        }
        if (this._expressConfig.uploadDir) {
            this._app.use(multer_1.default({
                dest: this._expressConfig.uploadDir
            }).any());
        }
        this.useMiddlewares(this._expressConfig.middlewares.before);
        for (let router of this._expressConfig.routes) {
            this._app.use(router.path, router.router);
        }
        //// socket io initialization
        this._socketIoConfig = config.socketio;
    }
    useMiddlewares(middlewares) {
        if (middlewares && middlewares.length) {
            for (let middleware of middlewares) {
                this._app.use(middleware);
            }
        }
    }
    socketIOListen(port) {
        if (this._socketIoConfig) {
            // server = server || this._server;
            // if (!server) {
            //   throw new Error('No server provided nor found in class');
            // }
            this._socketIo = socket_io_1.default(this._socketIoConfig.serverOptions);
            if (this._socketIoConfig.middlewares && this._socketIoConfig.middlewares.length) {
                for (let middleware of this._socketIoConfig.middlewares) {
                    this._socketIo.use(middleware);
                }
            }
            this._socketIo.on('connection', this._socketIoConfig.connectionHandler);
            this._socketIo.listen(port);
        }
    }
    listen(port, callback) {
        if (!this._middlewaresInUse) {
            this.useMiddlewares(this._expressConfig.middlewares.after);
            this._middlewaresInUse = true;
        }
        const server = this._app.listen(port, () => callback && callback(this._app));
        if (!this._server) {
            this._server = server;
        }
        return Promise.resolve(server);
    }
}
exports.App = App;
class SwaggerApp extends App {
    //constructor(swaggerConfigPath: string, middlewares: IHandlersArray, uploadDir?: string, routes: Array<IReadyRouter> = []) {
    constructor(config) {
        super(config.appConfig);
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