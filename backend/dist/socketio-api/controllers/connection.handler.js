"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _types_1 = require("../@types");
const common_service_1 = require("../../services/common.service");
const game_service_1 = require("../../services/game.service");
const bson_1 = require("bson");
const currentGames = {};
exports.connectionHandler = async (socket) => {
    try {
        await joinGame(socket.data.game, socket.data.session);
    }
    catch (err) {
        if (err instanceof common_service_1.ServiceError) {
            throw new _types_1.NamespaceMiddlewareError(err.message);
        }
        else {
            throw err;
        }
    }
};
async function joinGame(game, session) {
    if (game.state !== 'open') {
        throw new common_service_1.ServiceError('The game room is not open');
    }
    await game.populate('board').execPopulate();
    if (game.players.length === game.board.rules.playerLimits.max) {
        throw new common_service_1.ServiceError('The game room is full');
    }
    else if (session.game) {
        throw new common_service_1.ServiceError('The user has already joined some game under this session');
    }
    game.players.push({
        session: session,
        user: session.user,
        status: 'active'
    });
    session.game = game.id;
    if (await tryStartGame(game)) {
        game_service_1.stopSuspendedRemoving(game.id);
    }
    else {
        game_service_1.changeRemovingCondition(game.id, suspendedRemovingCondition);
    }
    await game.save();
    await session.save();
}
exports.joinGame = joinGame;
async function tryStartGame(game) {
    if (!game.populated('board')) {
        await game.populate('board').execPopulate();
    }
    if (game.players.length === game.board.rules.playerLimits.max) {
        game.state = 'playing';
        currentGames[game.id] = game;
        return true;
        // TODO: start game
    }
    else {
        return false;
    }
}
const suspendedRemovingCondition = async (game) => {
    if (!await tryStartGame(game)) {
        return false;
    }
    else {
        const promises = [];
        if (game.players.length) {
            for (let i = 0; i < game.players.length; i++) {
                if (game.players[i].session instanceof bson_1.ObjectID) {
                    await game.populate('players.' + i + '.user').execPopulate();
                }
                // TODO: add players disconnecting
                const session = game.players[i].session;
                session.game = null;
                promises.push(session.save());
            }
            await Promise.all(promises);
        }
        return true;
    }
};
//# sourceMappingURL=connection.handler.js.map