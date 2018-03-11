"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("config"));
const app_root_path_1 = __importDefault(require("app-root-path"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = require("./models/user.model");
const mongoConfig = config_1.default.get('mongodb');
const dbConnection = mongoose_1.default.createConnection(mongoConfig.host + ':' + mongoConfig.port + '/' + mongoConfig.dbName);
dbConnection.catch(softExit);
const User = user_model_1.bindUser(dbConnection);
const app_1 = require("./app");
const routes_1 = require("./routes");
const passport_auth_service_1 = __importDefault(require("./services/passport-auth.service"));
const middlewares = [];
middlewares.push(passport_auth_service_1.default.initialize(), passport_auth_service_1.default.session());
const swaggerConfigPath = app_root_path_1.default.resolve(config_1.default.get('swaggerConfig'));
const uploadDir = app_root_path_1.default.resolve(config_1.default.get('uploadDir'));
const app = new app_1.SwaggerApp(swaggerConfigPath, routes_1.apiRoutes, uploadDir, middlewares);
app.listen(config_1.default.get('port'), (app) => {
    console.log('listening');
}).catch(softExit);
function softExit(err) {
    console.error(err);
    process.kill(process.pid, 'SIGTERM');
}
//# sourceMappingURL=index.js.map