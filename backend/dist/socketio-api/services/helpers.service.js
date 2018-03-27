"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const authentication_service_1 = require("../../services/authentication.service");
const config_1 = __importDefault(require("config"));
const error_handler_service_1 = require("../../services/error-handler.service");
let authService;
let service;
function getService() {
    if (service) {
        return service;
    }
    authService = authentication_service_1.getService();
    service = {
        checkAuthAndAccessMiddleware: async (socket, next) => {
            try {
                const req = socket.request;
                let state = authService.getState(req);
                if (!state) {
                    const token = authService.getToken(req);
                    state = await authService.getAuthStateFromToken(token);
                    if (!state) {
                        return next(new authentication_service_1.ClientAuthError("Invalid Token"));
                    }
                }
                const gameId = getGameId(req.url);
                if (!gameId) {
                    return next(new error_handler_service_1.ClientRequestError("Invalid game id"));
                }
                // get the game and do something else
                next();
            }
            catch (err) {
                next(err);
            }
        }
    };
    return service;
}
exports.getService = getService;
let urls = config_1.default.get('socketIO');
const baseUrl = `/${urls.baseUrl}/${urls.apiSwitch}/`.replace(/\/\//g, '/');
const gameIdRegex = /^[a-f\d]{24}$/i;
function getGameId(url) {
    if (!url.startsWith(baseUrl)) {
        return null;
    }
    const gameId = url.split('?')[0].replace(baseUrl, '').replace(/\//, '');
    return gameIdRegex.test(gameId) ? gameId : null;
}
//# sourceMappingURL=helpers.service.js.map