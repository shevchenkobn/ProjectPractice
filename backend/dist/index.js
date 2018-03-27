"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("config"));
const app_root_path_1 = __importDefault(require("app-root-path"));
const path_1 = __importDefault(require("path"));
const app_1 = require("./app");
const index_1 = require("./routes/index");
const models_1 = require("./models");
const user_model_1 = __importDefault(require("./models/user.model"));
const database_service_1 = require("./services/database.service");
const passport_service_1 = require("./services/passport.service");
const error_handler_service_1 = require("./services/error-handler.service");
const authentication_service_1 = require("./services/authentication.service");
const socketio_api_1 = require("./socketio-api");
const mongoConfig = config_1.default.get('mongodb');
let dbConnection = database_service_1.initialize(mongoConfig);
(async () => {
    dbConnection = await dbConnection;
    const models = models_1.initialize(dbConnection);
    const passport = passport_service_1.initialize(models[user_model_1.default.getModelName()]);
    const middlewares = {
        before: [passport.initialize()],
        after: [error_handler_service_1.errorHandler]
    };
    const swaggerConfigPath = app_root_path_1.default.resolve(config_1.default.get('swaggerConfig'));
    const uploadDir = app_root_path_1.default.resolve(config_1.default.get('uploadDir'));
    const app = new app_1.SwaggerApp({
        appConfig: {
            express: {
                middlewares,
                uploadDir,
                routes: index_1.initialize()
            },
            socketio: socketio_api_1.getConfig()
        },
        swagger: {
            filepath: swaggerConfigPath,
            securityOptions: {
                Bearer: authentication_service_1.getService().swaggerBearerJwtChecker
            },
            routerOptions: {
                controllers: path_1.default.resolve(__dirname, './rest-api/controllers'),
            },
            validatorOptions: {
                validateResponse: true
            }
        }
    });
    const server = await app.listen(config_1.default.get('port'), app => {
        console.log('listening');
    });
})().catch(softExit);
function softExit(err) {
    console.error(err);
    process.kill(process.pid, database_service_1.terminateSignal);
}
//# sourceMappingURL=index.js.map