"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_service_1 = require("./services/helpers.service");
const config_1 = __importDefault(require("config"));
let helpersService;
let socketConfig;
let upgradeUrl = config_1.default.get('socketSwitchUrl');
if (upgradeUrl[upgradeUrl.length - 1] === '/') {
    upgradeUrl = upgradeUrl.slice(0, -1);
}
function getConfig() {
    if (socketConfig) {
        return socketConfig;
    }
    helpersService = helpers_service_1.getService();
    const middlewares = [
        helpersService.checkAuthAndAccessMiddleware
    ];
    socketConfig = {
        middlewares,
        connectionHandler: (socket) => {
            console.log('connected: ', socket);
        },
        serverOptions: {
            // serveClient: true,
            path: upgradeUrl
        }
    };
    return socketConfig;
}
exports.getConfig = getConfig;
//# sourceMappingURL=index.js.map