"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("config"));
const app_1 = require("./app");
const mongoConfig = config_1.default.get('mongodb');
const swaggerConfig = config_1.default.get('swaggerConfig');
const app = new app_1.SwaggerApp(swaggerConfig);
app.listen(config_1.default.get('port'), () => {
    console.log('listening');
}).catch(err => {
    console.error(err);
    process.nextTick(() => process.exit(1));
});
//# sourceMappingURL=index.js.map