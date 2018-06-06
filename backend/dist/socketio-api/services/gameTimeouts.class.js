"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GameTimeouts {
    constructor() {
        this._gameTimeouts = {};
    }
    set(gameId, timeout, callback, callbackThis, ...args) {
        if (this._gameTimeouts[gameId]) {
            throw new Error('A timeout for the game is already set!');
        }
        else {
            this._gameTimeouts[gameId] = global.setTimeout(this.gameTimeout.bind(this, gameId, callback, callbackThis, ...args), timeout);
        }
    }
    clear(gameId) {
        if (this._gameTimeouts[gameId]) {
            clearTimeout(this._gameTimeouts[gameId]);
            delete this._gameTimeouts[gameId];
        }
    }
    has(gameId) {
        return !!this._gameTimeouts[gameId];
    }
    gameTimeout(gameId, callback, callbackThis, ...args) {
        this.clear(gameId);
        callback.apply(callbackThis, args);
    }
}
exports.GameTimeouts = GameTimeouts;
//# sourceMappingURL=gameTimeouts.class.js.map