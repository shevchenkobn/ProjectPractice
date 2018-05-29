"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("config"));
const game_controller_1 = require("./controllers/game.controller");
let helpersService;
let socketIoNamespaces;
const upgradeUrl = config_1.default.get('socketIO').baseUrl;
function initialize(server) {
    if (socketIoNamespaces) {
        return socketIoNamespaces;
    }
    if (!server) {
        throw new Error('Server must be provided');
    }
    // helpersService = getService();
    socketIoNamespaces = [
        game_controller_1.initialize(server)
    ];
    return socketIoNamespaces;
}
exports.initialize = initialize;
function getSocketIoServerOptions() {
    return {
        serveClient: true,
        path: upgradeUrl
    };
}
exports.getSocketIoServerOptions = getSocketIoServerOptions;
;
//# sourceMappingURL=index.js.map