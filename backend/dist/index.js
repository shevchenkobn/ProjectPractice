"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("config"));
const app_root_path_1 = __importDefault(require("app-root-path"));
const app_1 = require("./app");
const index_1 = require("./routes/index");
const mongoConfig = config_1.default.get('mongodb');
const swaggerConfig = app_root_path_1.default.resolve(config_1.default.get('swaggerConfig'));
const uploadDir = app_root_path_1.default.resolve(config_1.default.get('uploadDir'));
const app = new app_1.SwaggerApp(swaggerConfig, index_1.apiRoutes, uploadDir);
app.listen(config_1.default.get('port'), (app) => {
    console.log('listening');
}).catch(err => {
    console.error(err);
    process.kill(process.pid, 'SIGTERM');
});
//# sourceMappingURL=index.js.map