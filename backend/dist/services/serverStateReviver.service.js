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
            console.log('removed', game.id);
        }
        else {
            actualGames.push(game);
        }
    }
    await Promise.all(outdatedGames);
    return () => {
        const now = Date.now();
        for (let game of actualGames) {
            game_service_1.suspendRemoving(game, Math.max(0, now - +game.createdAt)).catch(err => console.log(err)).then((game) => console.log(game.id)); //TODO: add logging here
            console.log('suspended', game.id);
        }
    };
}
exports.getReviverFunction = getReviverFunction;
//# sourceMappingURL=serverStateReviver.service.js.map