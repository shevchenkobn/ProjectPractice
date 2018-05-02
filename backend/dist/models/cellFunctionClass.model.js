"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/**
 * Schema section
 */
const feeDescriptorSchema = new mongoose_1.Schema({
    type: {
        type: String,
        required: false
    }
}, {
    _id: false
});
const improvementsSchema = new mongoose_1.Schema({
    price: {
        type: Number,
        min: 0,
        required: true
    }
}, {
    _id: false
});
const cellFunctionClassSchema = new mongoose_1.Schema({
    type: {
        type: String,
        required: true,
        enum: ['building']
    },
    functions: {
        type: [{ type: [mongoose_1.Schema.Types.ObjectId], ref: 'CellFunction' }],
        required: true
    },
    descriptor: {
        improvements: {
            type: improvementsSchema,
            required: false
        },
        price: {
            type: Number,
            required: false
        },
        feeDescriptor: {
            type: feeDescriptorSchema,
            required: false
        }
    }
}, {
    timestamps: true,
    collection: 'cellFunctionClasses'
});
let _modelName = 'CellFunctionClass';
let CellFunctionClass;
let _connection;
const initializer = {
    bindToConnection(connection, modelName = _modelName) {
        if (CellFunctionClass) {
            throw new TypeError('CellFunctionClass is already bound to connection');
        }
        _modelName = modelName;
        _connection = connection;
        CellFunctionClass = connection.model(modelName, cellFunctionClassSchema);
        return CellFunctionClass;
    },
    getModel() {
        if (!CellFunctionClass) {
            throw new TypeError('CellFunctionClass is not bound to connection');
        }
        return CellFunctionClass;
    },
    isBoundToConnection(connection = _connection) {
        return CellFunctionClass && _connection && connection == _connection;
    },
    getModelName() {
        return _modelName;
    }
};
exports.default = initializer;
//# sourceMappingURL=cellFunctionClass.model.js.map