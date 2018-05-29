"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const game_model_1 = __importDefault(require("../models/game.model"));
const common_service_1 = require("./common.service");
const board_service_1 = require("./board.service");
const config_1 = __importDefault(require("config"));
const events_1 = require("events");
let gamesConfig;
let Game;
function initialize() {
    gamesConfig = config_1.default.get('games');
    Game = game_model_1.default.getModel();
}
exports.initialize = initialize;
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
    await game.extendedPopulate(populatePaths, true);
    return game;
};
exports.removeGame = async (id, userId) => {
    const game = await exports.findGame(id);
    if (game.createdBy.toHexString() !== userId) {
        throw new common_service_1.ServiceError('You are didn\'t created the game so you are not able to delete it.');
    }
    if (game.players.length) {
        throw new common_service_1.ServiceError('There are players connected to the game. Delete is impossible.');
    }
    await game.remove();
};
exports.constructAndSaveGame = async (boardId, userId, createSuspendedRemoving = true) => {
    if (await Game.count({
        createdBy: userId,
        state: 'open'
    }) >= gamesConfig.gamesPerUser) {
        throw new common_service_1.ServiceError(`The user "${userId}" has created maximum possible games (${gamesConfig.gamesPerUser})`);
    }
    await board_service_1.findBoard(boardId);
    try {
        const newGame = new Game({
            createdBy: userId,
            board: boardId
        });
        await newGame.save();
        if (createSuspendedRemoving) {
            exports.suspendRemoving(newGame, gamesConfig.removeTimeout)
                // .then(err => console.log(err))//TODO: add loggin in error callback
                .catch(err => console.log(err)); //TODO: add loggin in error callback
        }
        return newGame;
    }
    catch (err) {
        common_service_1.rethrowError(err);
    }
};
const removeTasks = {};
exports.suspendRemoving = (game, time) => {
    if (!game) {
        throw new TypeError('Game is undefined');
    }
    const id = game.id;
    if (removeTasks[id]) {
        throw new TypeError(`Remove timeout for "${id}" is already set`);
    }
    const eventEmitter = new events_1.EventEmitter();
    removeTasks[id] = [setTimeout(async () => {
            if (!removeTasks[id][1] || await removeTasks[id][1](game)) {
                game.remove()
                    .then((...args) => eventEmitter.emit('resolve', ...args))
                    .catch((...args) => eventEmitter.emit('reject', ...args));
            }
            else {
                exports.stopSuspendedRemoving(id);
                eventEmitter.emit('reject');
            }
        }, time), null];
    return new Promise((resolve, reject) => {
        eventEmitter.on('resolve', resolve);
        eventEmitter.on('reject', reject);
    });
};
exports.stopSuspendedRemoving = (gameId) => {
    if (!removeTasks[gameId]) {
        throw new Error(`No suspended removing is set for game id "${gameId}"`);
    }
    clearInterval(removeTasks[gameId][0]);
    delete removeTasks[gameId];
};
exports.changeRemovingCondition = (gameId, condition) => {
    if (!removeTasks[gameId]) {
        throw new Error('The game has no timeout for removing');
    }
    else if (removeTasks[gameId][1]) {
        throw new Error('A removing condition is already set');
    }
    removeTasks[gameId][1] = condition;
};
//# sourceMappingURL=game.service.js.map