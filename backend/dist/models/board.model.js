"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/**
 * Schema section
 */
const rangeSchema = new mongoose_1.Schema({
    max: {
        type: Number,
        required: true,
        min: 1
    },
    min: {
        type: Number,
        min: 1
    }
}, {
    _id: false
});
const defeatSchema = new mongoose_1.Schema({
    type: {
        type: String,
        required: true
    }
}, {
    _id: false
});
const cellSchema = new mongoose_1.Schema({
    cellId: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: Number.isInteger
        }
    },
    function: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'CellFunction'
    },
    next: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: Number.isInteger
        }
    }
}, {
    _id: false
});
const improvementsSchema = new mongoose_1.Schema({
    "type": {
        type: String,
        enum: ["levels"],
        required: true
    },
    "monopoly": {
        type: Boolean,
        required: true
    },
    "sell": {
        "price": {
            type: Number,
            required: true
        },
        "downgrade": {
            type: Boolean,
            required: true
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
        type: Object,
        required: true
    }
}, {
    _id: false
});
const boardSchema = new mongoose_1.Schema({
    rules: {
        initialCash: {
            type: Number,
            required: true
        },
        randomizeEventOptions: {
            type: Boolean,
            required: true
        },
        turnTime: {
            limit: {
                type: Number,
                required: true
            },
            defaultOption: {
                type: Number,
                required: true
            }
        },
        "playerLimits": rangeSchema,
        "hasRoles": {
            type: Boolean,
            required: true
        },
        "dices": [rangeSchema],
        "building": {
            "mortgage": {
                "price": {
                    type: Number,
                    required: true
                },
                "liftInterestPledgePercent": Number,
                "sell": {
                    "pricePercentPay": Number
                }
            },
            "improvements": improvementsSchema,
            "fee": {
                "fromMortgaged": {
                    type: Boolean,
                    required: true
                },
                "monopoly": {
                    "factor": {
                        type: Number,
                        required: true
                    },
                    "mortgageBreaks": {
                        type: Boolean,
                        required: true
                    }
                },
                "improvementsOverride": {
                    type: Boolean,
                    required: true
                }
            }
        },
        "sell": {
            "buyRequest": {
                type: Boolean,
                required: true
            },
            "sellRequest": {
                type: Boolean,
                required: true
            },
            "responseTimeout": {
                type: Number
            },
            "minPrice": {
                type: Number,
                required: true
            },
            "objects": {
                type: [String],
                enum: [
                    "building",
                    "inventory"
                ]
            }
        },
        "events": {
            type: [eventSchema],
            required: false
        },
        defeat: {
            type: [defeatSchema],
            required: true
        }
    },
    cells: {
        type: [cellSchema],
        required: true
    }
}, {
    timestamps: true,
    collection: 'boards'
});
boardSchema.methods.addCellFunctions = async function (poolEntities = true) {
    const pathPieces = ['cells.', '.function'];
    let sharedIDs;
    if (poolEntities) {
        sharedIDs = {};
        for (let i = 0; i < this.cells.length; i++) {
            if (!this.cells[i].function) {
                continue;
            }
            const id = this.cells[i].function.toHexString();
            if (sharedIDs[id]) {
                sharedIDs[id].push(i);
            }
            else {
                this.populate(pathPieces.join(i.toString()));
                sharedIDs[id] = [i];
            }
        }
    }
    else {
        for (let i = 0; i < this.cells.length; i++) {
            this.populate(pathPieces.join(i.toString()));
        }
    }
    await this.execPopulate();
    if (poolEntities) {
        for (let id of Object.keys(sharedIDs)) {
            const source = this.cells[sharedIDs[id][0]].function;
            for (let i = 1; i < sharedIDs[id].length; i++) {
                this.cells[sharedIDs[id][i]].function = source;
            }
        }
    }
    // if (!CellFunction) {
    //   CellFunction = CellFunctionInitializer.getModel();
    // }
    // const promises = [];
    // for (let i = 0; i < this.cells.length; i++) {
    //   if (this.cells[i].function instanceof Types.ObjectId) {
    //     promises[i] = CellFunction.findById(this.cells[i].function.toString());
    //   }
    // }
    // const functions = await Promise.all(promises);
    // // console.log(functions);
    // for (let i = 0; i < functions.length; i++) {
    //   if (functions[i]) {
    //     this.cells[i].function = functions[i];
    //   }
    // }
};
let _modelName = 'Board';
let Board;
let _connection;
const initializer = {
    bindToConnection(connection, modelName = _modelName) {
        if (Board) {
            throw new TypeError('Board is already bound to connection');
        }
        _modelName = modelName;
        _connection = connection;
        Board = connection.model(modelName, boardSchema);
        return Board;
    },
    getModel() {
        if (!Board) {
            throw new TypeError('Board is not bound to connection');
        }
        return Board;
    },
    isBoundToConnection(connection = _connection) {
        return Board && _connection && connection == _connection;
    },
    getModelName() {
        return _modelName;
    }
};
exports.default = initializer;
//# sourceMappingURL=board.model.js.map