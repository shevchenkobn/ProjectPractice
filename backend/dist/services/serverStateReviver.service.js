"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("config"));
const game_service_1 = require("./game.service");
const gamesConfig = config_1.default.get('games');
async function getReviverFunction() {
    const games = await game_service_1.findGames({
        filter: {
            state: 'open'
        }
    });
    const now = Date.now();
    const outdatedGames = [];
    const actualGames = [];
    for (let game of games) {
        if (now - +game.createdAt >= gamesConfig.removeTimeout) {
            outdatedGames.push(game.remove());
        }
        else {
            actualGames.push(game);
        }
    }
    await Promise.all(outdatedGames);
    // TODO: load data for all current started games
    return () => {
        const now = Date.now();
        for (let game of actualGames) {
            game_service_1.suspendRemoving(game, Math.max(0, now - +game.createdAt)).catch(err => console.log(err)); //TODO: add logging here
        }
    };
}
exports.getReviverFunction = getReviverFunction;
//# sourceMappingURL=serverStateReviver.service.js.map