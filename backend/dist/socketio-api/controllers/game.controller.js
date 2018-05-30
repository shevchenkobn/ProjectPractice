"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const game_model_1 = __importDefault(require("../../models/game.model"));
const common_service_1 = require("../../services/common.service");
const game_service_1 = require("../../services/game.service");
const session_model_1 = __importDefault(require("../../models/session.model"));
const bson_1 = require("bson");
const helpers_service_1 = require("../services/helpers.service");
const util_1 = require("util");
let Game;
let Session;
const namespaceName = '/games';
let helpersService;
let server;
let namespaceInfo;
let namespace;
// const currentClients: {[userId: string]: AuthorizedSocket} = {}; // FIXME: may be needed for better performance
function initialize(socketIoServer) {
    if (server && server !== socketIoServer) {
        throw new TypeError('Server is already initialized! Recheck or comment this line');
    }
    server = socketIoServer;
    namespace = server.of(namespaceName);
    helpersService = helpers_service_1.getService();
    Session = session_model_1.default.getModel();
    Game = game_model_1.default.getModel();
    namespaceInfo = {
        connectionHandler: exports.connectionHandler,
        middlewares: [
            helpersService.checkAuthAndAccessMiddleware
        ],
        name: namespaceName
    };
    return namespaceInfo;
}
exports.initialize = initialize;
exports.connectionHandler = async (socket) => {
    try {
        await joinGame(socket);
        socket.on('disconnect', async () => {
            try {
                await disconnectPlayerFromGame(await game_service_1.findGame(socket.data.gameId), await Session.findById(socket.data.sessionId));
            }
            catch (err) {
                // TODO: log error
            }
        });
    }
    catch (err) {
        socket.emit('disconnect-message', err);
        socket.disconnect(true);
    }
};
async function joinGame(socket) {
    const game = await game_service_1.findGame(socket.data.gameId);
    const session = await Session.findById(socket.data.sessionId);
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
    else if (!game_service_1.hasRemovingCondition(game.id)) {
        game_service_1.changeRemovingCondition(game.id, suspendedRemovingCondition);
    }
    await game.save();
    await session.save();
    socket.join(socket.data.gameId);
}
exports.joinGame = joinGame;
async function tryStartGame(game) {
    if (!game.populated('board')) {
        await game.populate('board').execPopulate();
    }
    if (game.players.length === game.board.rules.playerLimits.max) {
        game.state = 'playing';
        // TODO: start game
        console.log('game is started, really');
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
    if (await tryStartGame(game)) {
        return false;
    }
    else {
        if (game.players.length) {
            const withRoomNsp = namespace.to(game.id);
            const clients = await (util_1.promisify(withRoomNsp.clients.bind(withRoomNsp))());
            for (let client of clients) {
                namespace.connected[client].emit("disconnect-message", new Error("The room is being closed"));
                namespace.connected[client].disconnect(true);
            }
            // namespace.to(game.id).clients
            // (((err, clients) => {
            //   for (let client of clients) {
            //     namespace.connected[client].disconnect(true);
            //   }
            // }) as NamespaceClientsCallback);
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
async function disconnectPlayerFromGame(game, session) {
    // TODO: probably additional check game.id == session.id is needed
    const playerIndex = game.players.findIndex(player => {
        const playerSessionId = player.session instanceof bson_1.ObjectID
            ? player.session.toHexString()
            : player.session.id;
        return playerSessionId === session.id;
    });
    // if (playerIndex < 0) {
    //   throw new Error('This session is not attached to this game');
    // }
    game.players.splice(playerIndex, 1);
    await game.save();
    session.game = null;
    await session.save();
    // TODO: define user if 1 player left
    // TODO: add reconnect timeout and freeze game until time is up
}
//# sourceMappingURL=game.controller.js.map