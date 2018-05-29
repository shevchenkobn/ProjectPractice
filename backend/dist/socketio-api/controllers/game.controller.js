"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _types_1 = require("../@types");
const common_service_1 = require("../../services/common.service");
const game_service_1 = require("../../services/game.service");
const bson_1 = require("bson");
const helpers_service_1 = require("../services/helpers.service");
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
        await joinGame(socket.data.game, socket.data.session);
        // FIXME: use redis for better performance and cluster node
        // const userId = socket.data.session.user instanceof ObjectID
        //   ? socket.data.session.user.toHexString()
        //   : (socket.data.session.user as IUserDocument).id;
        // currentClients[userId] = socket;
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
        return true;
        // TODO: start game
    }
    else {
        return false;
    }
}
async function disconnectUser(userId) {
    const socket = Object.keys(namespace.connected).find(socketId => {
        const socketSessionUser = namespace.connected[socketId].data.session.user;
        const socketUserId = socketSessionUser instanceof bson_1.ObjectID
            ? socketSessionUser.toHexString()
            : socketSessionUser.id;
        return socketUserId === userId;
    });
    if (socket) {
        namespace.connected[socket].disconnect(true);
    }
}
exports.disconnectUser = disconnectUser;
const suspendedRemovingCondition = async (game) => {
    if (!await tryStartGame(game)) {
        return false;
    }
    else {
        const promises = [];
        await game.extendedPopulate(['players.sessions']);
        if (game.players.length) {
            for (let i = 0; i < game.players.length; i++) {
                const session = game.players[i].session;
                session.game = null;
                promises.push(session.save());
            }
            // FIXME: try this if fails to(room).clients() loop
            namespace.to(game.id).emit('disconnect');
            await Promise.all(promises);
        }
        return true;
    }
};
//# sourceMappingURL=game.controller.js.map