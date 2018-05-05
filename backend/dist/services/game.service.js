"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const game_model_1 = __importDefault(require("../models/game.model"));
const common_service_1 = require("./common.service");
const board_service_1 = require("./board.service");
const gamesPerUser = 3;
const Game = game_model_1.default.getModel();
exports.findGames = async (options) => {
    const filter = options.filter || {};
    const queryOptions = {};
    if (Array.isArray(options.sort)) {
        queryOptions.sort = options.sort;
    }
    if (typeof options.limit === 'number') {
        queryOptions.limit = options.limit;
    }
    if (typeof options.offset === 'number') {
        queryOptions.skip = options.offset;
    }
    if (options.lean) {
        queryOptions.lean = options.lean;
    }
    try {
        return await Game.find(filter, null, queryOptions);
    }
    catch (err) {
        common_service_1.rethrowError(err);
    }
};
exports.findGame = async (id, populatePaths) => {
    let game;
    try {
        game = await Game.findById(id);
    }
    catch (err) {
        common_service_1.rethrowError(err);
    }
    if (!game) {
        throw new common_service_1.ServiceError('Invalid game id');
    }
    await game.extendedPopulate(populatePaths);
    return game;
};
exports.removeGame = async (id) => {
    const game = await exports.findGame(id);
    if (game.players.length) {
        throw new common_service_1.ServiceError('There are players connected to the game. Delete is impossible.');
    }
    await game.remove();
};
exports.constructAndSaveGame = async (boardId, userId) => {
    if (await Game.count({
        createdBy: userId,
        state: 'open'
    }) >= gamesPerUser) {
        throw new common_service_1.ServiceError(`The user "${userId}" has created maximum possible games (${gamesPerUser})`);
    }
    await board_service_1.findBoard(boardId);
    try {
        const newGame = new Game({
            createdBy: userId,
            board: boardId
        });
        await newGame.save();
        return newGame;
    }
    catch (err) {
        common_service_1.rethrowError(err);
    }
};
//# sourceMappingURL=game.service.js.map