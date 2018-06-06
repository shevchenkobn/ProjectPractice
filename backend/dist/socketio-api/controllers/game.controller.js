"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const game_model_1 = __importDefault(require("../../models/game.model"));
const common_service_1 = require("../../services/common.service");
const game_service_1 = require("../../services/game.service");
const session_model_1 = __importDefault(require("../../models/session.model"));
const helpers_service_1 = require("../services/helpers.service");
const gameLoop_class_1 = require("./gameLoop.class");
const helpers_service_2 = require("../../services/helpers.service");
let Game;
let Session;
const namespaceName = '/games';
let server;
let namespaceInfo;
let namespace;
// const currentClients: {[userId: string]: AuthorizedSocket} = {}; // FIXME: may be needed for better performance
function initialize(socketIoServer) {
    if (server && server !== socketIoServer) {
        throw new TypeError('Server is already initialized!');
    }
    server = socketIoServer;
    namespace = server.of(namespaceName);
    Session = session_model_1.default.getModel();
    Game = game_model_1.default.getModel();
    namespaceInfo = {
        connectionHandler: exports.connectionHandler,
        middlewares: [
            helpers_service_1.checkAuthAndAccessMiddleware
        ],
        name: namespaceName
    };
    return namespaceInfo;
}
exports.initialize = initialize;
exports.connectionHandler = async (socket) => {
    try {
        await joinGame(socket);
        socket.on('disconnect', disconnectHandler.bind(this, socket));
    }
    catch (err) {
        // TODO: log error
        helpers_service_1.disconnectSocket(socket, err);
        try {
            namespace.to(socket.data.gameId).emit('player-left', {
                id: (await Session.findById(socket.data.sessionId)).user.toHexString()
            });
        }
        catch (err) {
            // TODO: log error
        }
    }
};
async function joinGame(socket) {
    const game = await game_service_1.findGame(socket.data.gameId);
    const session = await Session.findById(socket.data.sessionId);
    if (game.status !== 'open') {
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
    if (!(await trySetCoundownForGame(game) || game_service_1.hasRemovingCondition(game.id))) {
        game_service_1.changeRemovingCondition(game.id, suspendedRemovingCondition);
    }
    await game.save();
    await session.save();
    namespace.to(socket.data.gameId).emit('player-joined', {
        id: session.user.toHexString()
    });
    socket.join(socket.data.gameId);
}
exports.joinGame = joinGame;
async function trySetCoundownForGame(game, mustBeFull = true) {
    if (!game.populated('board')) {
        await game.populate('board').execPopulate();
    }
    if (mustBeFull && game.players.length === game.board.rules.playerLimits.max
        || game.players.length >= game.board.rules.playerLimits.min) {
        game.status = 'playing';
        await game.save();
        if (game_service_1.hasRemovingCondition(game.id)) {
            game_service_1.stopSuspendedRemoving(game.id);
        }
        for (let clientId of await helpers_service_1.getClientIds(namespace, game.id)) {
            namespace.connected[clientId].once('ready', readyHandler);
        }
        game_service_1.suspendRemoving(game.id, game_service_1.gamesConfig.startCountdown);
        game_service_1.changeRemovingCondition(game.id, countdownRemovingCondition);
        return true;
    }
    else {
        return false;
    }
}
function disconnectUser(session) {
    // if (!session.game) {
    //   return;
    // }
    return new Promise((resolve, reject) => {
        namespace.to(session.populated('game')
            ? session.game.id
            : session.game.toHexString()).clients((async (err, clients) => {
            if (err) {
                reject(err);
            }
            const socketId = clients.find(socketId => {
                return namespace.connected[socketId].data.sessionId === session.id;
            });
            if (socketId) {
                namespace.connected[socketId].disconnect(true);
                // if (!session.populated('game')) {
                //   await session.populate('game').execPopulate();
                // }
                // await disconnectPlayerFromGame(session.game as IGameDocument, session);
            }
            resolve();
        }));
    });
}
exports.disconnectUser = disconnectUser;
const suspendedRemovingCondition = async (game) => {
    if (await trySetCoundownForGame(game, false)) {
        return false;
    }
    else {
        if (game.players.length) {
            const clients = await helpers_service_1.getClientIds(namespace, game.id);
            for (let client of clients) {
                helpers_service_1.disconnectSocket(namespace.connected[client], new Error("The room is being closed"));
            }
            const promises = [];
            await game.extendedPopulate(['players.sessions']);
            for (let i = 0; i < game.players.length; i++) {
                const session = game.players[i].session;
                session.game = null;
                promises.push(session.save());
            }
            await Promise.all(promises);
        }
        return true;
    }
};
const countdownRemovingCondition = async (game) => {
    if (game.populated('board')) {
        await game.populate('board');
    }
    if (game.players.reduce((sum, player) => {
        if (player.status !== 'gone') {
            sum++;
        }
        return sum;
    }, 0) >= game.board.rules.playerLimits.min) {
        for (let player of game.players) {
            if (player.status === 'waiting') {
                player.status = 'active';
            }
        }
        await game.save();
        startGame(game).then(() => {
            // TODO: add logging
        }).catch(err => {
            // TODO: add logging      
        });
        return false;
    }
    else {
        return true;
    }
};
async function disconnectPlayerFromGame(game, session) {
    // FIXME: probably additional check game.id == session.id is needed
    const playerIndex = game.players.findIndex(player => {
        const playerSessionId = helpers_service_2.getId(player.session);
        return playerSessionId === session.id;
    });
    // if (playerIndex < 0) {
    //   throw new Error('This session is not attached to this game');
    // }
    if (game.status === 'open') {
        game.players.splice(playerIndex, 1);
    }
    else {
        game.players[playerIndex].status = 'gone';
        game.players[playerIndex].whenGone = new Date();
    }
    await game.save();
    session.game = null;
    await session.save();
    namespace.to(game.id).emit('player-left', {
        id: session.populated('user') ? session.user.id : session.user.toHexString()
    });
    if (game.status === 'playing') {
        (await gameLoop_class_1.GameLoopController.getInstance(game.populated('board') ? game.board.id : game.board.toHexString())).tryWinGame(game);
    }
    // TODO: add reconnect timeout and freeze game until time is up
}
async function startGame(game) {
    if (!game.populated('board')) {
        await game.populate('board');
    }
    const controller = await gameLoop_class_1.GameLoopController.getInstance(game.board.id);
    return await controller.initiateGame(game);
}
async function disconnectHandler(socket) {
    try {
        await disconnectPlayerFromGame(await game_service_1.findGame(socket.data.gameId), await Session.findById(socket.data.sessionId));
    }
    catch (err) {
        // TODO: log error
    }
}
async function readyHandler(socket) {
    try {
        const game = await game_service_1.findGame(socket.data.gameId);
        game.players.find(player => player.session.toHexString() === socket.data.sessionId).status = 'active';
        await game.save();
        const nonGonePlayers = game.players.filter(player => player.status !== 'gone');
        if (nonGonePlayers.length === nonGonePlayers.reduce((count, player) => {
            if (player.status === 'active') {
                count++;
            }
            return count;
        }, 0)) {
            game_service_1.stopSuspendedRemoving(game.id);
            // FIXME: uncomment if once is not working
            // for (let socketId of await getClientIds(namespace, game.id)) {
            //   namespace.connected[socketId].removeAllListeners('ready');
            // }
            startGame(game).then(() => {
                // TODO: add logging
            }).catch(err => {
                // TODO: add logging      
            });
        }
    }
    catch (err) {
        // TODO: log error
    }
}
//# sourceMappingURL=game.controller.js.map