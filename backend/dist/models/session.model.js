"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/**
 * Schema section
 */
const sessionSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    game: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Game'
    },
    status: {
        type: String,
        enum: ['active', 'outdated'],
        default: 'active',
        required: true,
    }
}, {
    timestamps: true,
    toObject: {
        transform: (doc, res) => {
            return {
                id: doc.id
            };
        }
    }
});
/**
 * Export section
 */
let _modelName = 'Session';
let Session;
let _connection;
const initializer = {
    bindToConnection(connection, modelName = _modelName) {
        if (Session) {
            throw new TypeError('User is already bound to connection');
        }
        _modelName = modelName;
        _connection = connection;
        Session = connection.model(modelName, sessionSchema);
        return Session;
    },
    getModel() {
        if (!Session) {
            throw new TypeError('Session is not bound to connection');
        }
        return Session;
    },
    isBoundToConnection(connection = _connection) {
        return Session && _connection && connection === _connection;
    },
    getModelName() {
        return _modelName;
    }
};
exports.default = initializer;
//# sourceMappingURL=session.model.js.map