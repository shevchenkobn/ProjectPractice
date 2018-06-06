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
const shuffle_array_1 = __importDefault(require("shuffle-array"));
const util_1 = require("util");
let authService;
exports.checkAuthAndAccessMiddleware = async (socket, next) => {
    try {
        const req = socket.request;
        let session = authService.getState(req);
        if (!session) {
            const token = authService.getToken(req);
            session = await authService.getSessionFromToken(token);
            if (!session) {
                return next(new _types_1.NamespaceMiddlewareError("Invalid Token"));
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
            return next(new _types_1.NamespaceMiddlewareError("Invalid game id"));
        }
        socket.data = {
            sessionId: session.id,
            gameId: gameId
        };
        next();
    }
    catch (err) {
        next(err);
    }
};
function initialize() {
    if (authService) {
        return;
    }
    authService = authentication_service_1.getService();
}
exports.initialize = initialize;
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
function disconnectSocket(socket, message, close = true) {
    socket.emit('disconnect-message', message);
    socket.disconnect(close);
}
exports.disconnectSocket = disconnectSocket;
function getClientIds(nsp, room) {
    const nspWithRoom = nsp.in(room);
    return util_1.promisify(nspWithRoom.clients.bind(nspWithRoom))();
}
exports.getClientIds = getClientIds;
function getRange(size, shuffle = false) {
    const arr = Array.apply(null, { length: size })
        .map(Number.call, Number); // range [0 ... length]
    if (shuffle) {
        shuffle_array_1.default(arr);
    }
    return arr;
}
exports.getRange = getRange;
function getIntegerBetween(min, max) {
    min = Math.round(min), max = Math.round(max + 1);
    return Math.round(min + Math.random() * (max - min));
}
exports.getIntegerBetween = getIntegerBetween;
//# sourceMappingURL=helpers.service.js.map