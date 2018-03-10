"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("config"));
const app_1 = require("./app");
const mongoConfig = config_1.default.get('mongodb');
const app = new app_1.App([]);
app.listen(config_1.default.get('port'));
//# sourceMappingURL=index.js.map