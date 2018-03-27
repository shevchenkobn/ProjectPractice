"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_service_1 = require("./services/helpers.service");
const config_1 = __importDefault(require("config"));
let helpersService;
let socketConfig;
const upgradeUrl = config_1.default.get('socketIO').baseUrl;
function getConfig() {
    if (socketConfig) {
        return socketConfig;
    }
    helpersService = helpers_service_1.getService();
    const gameMiddlewares = [
        helpersService.checkAuthAndAccessMiddleware
    ];
    socketConfig = {
        namespaces: {
            '/games': {
                middlewares: gameMiddlewares,
                connectionHandler: (socket) => {
                    // console.log('connected: ', socket);          
                }
            }
        },
        serverOptions: {
            serveClient: true,
            path: upgradeUrl
        }
    };
    return socketConfig;
}
exports.getConfig = getConfig;
//# sourceMappingURL=index.js.map