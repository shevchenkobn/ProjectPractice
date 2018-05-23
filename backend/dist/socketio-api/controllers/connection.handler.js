"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_service_1 = require("../../services/common.service");
exports.connectionHandler = socket => {
    console.log(socket);
};
async function joinGame(game, session) {
    await game.populate('board');
    if (game.state != 'open') {
        throw new common_service_1.ServiceError('The game room is not open');
    }
    else if (game.players.length)
        ;
}
exports.joinGame = joinGame;
//# sourceMappingURL=connection.handler.js.map