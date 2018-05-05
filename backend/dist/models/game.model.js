"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/**
 * Schema section
 */
const playerSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    role: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: false,
        ref: 'CellFunction'
    },
    status: {
        type: String,
        required: true,
        enum: [
            'active',
            'gone'
        ],
        default: 'active'
    },
    dateLeft: {
        type: Date,
        required: false
    },
    cash: {
        type: Number,
        required: true,
        default: 0
    },
    assets: {
        type: Number,
        required: true,
        default: 0
    },
    depts: {
        type: {},
        required: false
    },
    cellId: {
        type: Number,
        required: true,
        default: 0
    },
    possessions: {
        type: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'CellFunction' }],
        required: true,
        default: []
    },
    monopolies: {
        type: {},
        required: false
    },
    modifiers: {
        type: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'CellFunction' }],
        required: true,
    },
    mortgaged: {
        type: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'CellFunction' }],
        required: true
    }
}, {
    _id: false
});
const gameSchema = new mongoose_1.Schema({
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    state: {
        type: String,
        required: true,
        enum: [
            'open',
            'playing',
            'finished'
        ],
        default: 'open'
    },
    board: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "Board"
    },
    winner: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: false,
        ref: 'User'
    },
    stepCount: {
        type: Number,
        min: 0,
        default: 0,
    },
    playerIndex: {
        type: Number,
        min: 0,
        default: 0,
    },
    players: {
        type: [playerSchema],
        required: true,
        default: []
    }
}, {
    timestamps: true,
    collection: 'games'
});
let _modelName = 'Game';
let Game;
let _connection;
const initializer = {
    bindToConnection(connection, modelName = _modelName) {
        if (Game) {
            throw new TypeError('Game model is already bound to connection');
        }
        _modelName = modelName;
        _connection = connection;
        Game = connection.model(modelName, gameSchema);
        return Game;
    },
    getModel() {
        if (!Game) {
            throw new TypeError('Game model is not bound to connection');
        }
        return Game;
    },
    isBoundToConnection(connection = _connection) {
        return Game && _connection && connection == _connection;
    },
    getModelName() {
        return _modelName;
    }
};
exports.default = initializer;
//# sourceMappingURL=game.model.js.map