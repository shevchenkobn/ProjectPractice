"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/**
 * Schema section
 */
const improvementSchema = new mongoose_1.Schema({
    fee: {
        type: Number,
        min: 0,
        required: true
    }
}, {
    _id: false
});
const buildingSchema = new mongoose_1.Schema({
    price: {
        type: Number,
        min: 0,
        required: true
    },
    fee: {
        type: Number,
        min: 0,
        required: true
    },
    improvements: {
        type: [improvementSchema],
        required: true
    }
}, {
    _id: false
});
const modifierSchema = new mongoose_1.Schema({
    actions: {
        type: [{}],
        required: true
    },
    break: {
        triggers: {
            type: [String],
            required: true
        },
        action: {
            type: {},
            required: false
        }
    }
}, {
    _id: false
});
const sellableSchema = new mongoose_1.Schema({
    price: {
        type: Number,
        required: true,
    },
    priceFixed: {
        type: Boolean,
        required: true
    }
}, {
    _id: false
});
const inventorySchema = new mongoose_1.Schema({
    action: {
        type: {},
        required: true
    },
    sellable: {
        type: sellableSchema,
        required: false
    }
}, {
    _id: false
});
const optionSchema = new mongoose_1.Schema({
    optionId: {
        type: Number,
        min: 0,
        validate: {
            validator: Number.isInteger
        }
    }
}, {
    _id: false
});
const eventSchema = new mongoose_1.Schema({
    triggers: {
        type: [String],
        required: true
    },
    action: {
        type: {},
        required: false
    },
    options: {
        type: [optionSchema],
        required: false
    }
}, {
    _id: false
});
const cellFunctionSchema = new mongoose_1.Schema({
    class: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'CellFunctionClass'
    },
    event: {
        type: eventSchema,
        required: false
    },
    building: {
        type: buildingSchema,
        required: false
    },
    modifier: {
        type: modifierSchema,
        required: false
    },
    inventory: {
        type: inventorySchema,
        required: false
    }
}, {
    timestamps: true,
    collection: 'cellFunctions'
});
let _modelName = 'CellFunction';
let CellFunction;
let _connection;
const initializer = {
    bindToConnection(connection, modelName = _modelName) {
        if (CellFunction) {
            throw new TypeError('CellFunction is already bound to connection');
        }
        _modelName = modelName;
        _connection = connection;
        CellFunction = connection.model(modelName, cellFunctionSchema);
        return CellFunction;
    },
    getModel() {
        if (!CellFunction) {
            throw new TypeError('CellFunction is not bound to connection');
        }
        return CellFunction;
    },
    isBoundToConnection(connection = _connection) {
        return CellFunction && _connection && connection == _connection;
    },
    getModelName() {
        return _modelName;
    }
};
exports.default = initializer;
//# sourceMappingURL=cellFunction.model.js.map