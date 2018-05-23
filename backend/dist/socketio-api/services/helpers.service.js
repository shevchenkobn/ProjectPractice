"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _types_1 = require("./../@types");
const authentication_service_1 = require("../../services/authentication.service");
const config_1 = __importDefault(require("config"));
const game_service_1 = require("../../services/game.service");
const common_service_1 = require("../../services/common.service");
const connection_handler_1 = require("../controllers/connection.handler");
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
                let session = authService.getState(req);
                if (!session) {
                    const token = authService.getToken(req);
                    session = await authService.getSessionFromToken(token);
                    if (!session) {
                        return next(new _types_1.NspMiddlewareError("Invalid Token"));
                    }
                }
                const gameId = getGameId(req.url);
                let game;
                try {
                    game = await game_service_1.findGame(gameId);
                }
                catch (err) {
                    common_service_1.rethrowError(err);
                }
                if (!game) {
                    return next(new _types_1.NspMiddlewareError("Invalid game id"));
                }
                await connection_handler_1.joinGame(game, session);
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
// const gameIdRegex = /^[a-f\d]{24}$/i;
function getGameId(url) {
    if (!url.startsWith(baseUrl)) {
        return null;
    }
    const gameId = url.split('?')[0].replace(baseUrl, '').replace('\/', '');
    return gameId; //gameIdRegex.test(gameId) ? gameId : null;
}
//# sourceMappingURL=helpers.service.js.map