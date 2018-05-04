import { IModelInitializer } from './index';
import { Types, Schema, Connection, Model, Document } from 'mongoose';
import mongoose from 'mongoose';
import { ICellFunctionDocument } from './cellFunction.model';

/**
 * Interfaces section
 */
export interface IRange {
  min?: number,
  max?: number
}

export interface IBoardEvent {
  triggers: Array<string>
  action: any
}

export interface IBoardDefeat {
  type: string
}

export interface IBoardCell {
  cellId: number,
  function?: Types.ObjectId | ICellFunctionDocument
  next?: number
}

export interface IBoardDocument extends Document {
  "rules": {
    "initialCash": number,
    "randomizeEventOptions": boolean,
    "turnTime": {
      "limit": number,
      "defaultOption": number
    },
    "playerLimits": IRange,
    "hasRoles": boolean,
    "dices": Array<IRange>,
    "building": {
      "mortgage": {
        "price": number,
        "liftInterestPledgePercent": number,
        "sell": {
          "pricePercentPay": number
        }
      },
      "improvements": {
        "type": "string",
        "monopoly": boolean,
        "sell": {
          "price": number,
          "downgrade": boolean
        }
      },
      "fee": {
        "fromMortgaged": boolean,
        "monopoly": {
          "factor": number,
          "mortgageBreaks": boolean
        },
        "improvementsOverride": boolean
      }
    },
    "sell": {
      "buyRequest": boolean,
      "sellRequest": boolean,
      "responseTimeout"?: number,
      "minPrice": number,
      "objects": Array<string>
    },
    "events": Array<IBoardEvent>,
    "defeat": Array<IBoardDefeat>
  },
  "cells": Array<IBoardCell & Document>,
  addCellFunctions(): Promise<void>;
}

export interface IBoardModel extends Model<IBoardDocument> {}

/**
 * Schema section
 */

const rangeSchema = new Schema({
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

const defeatSchema = new Schema({
  type: {
    type: String,
    required: true
  }
}, {
  _id: false
});

const cellSchema = new Schema(<any>{
  cellId: {
    type: Number,
    required: true,
    min: 0,
    validate : {
      validator : Number.isInteger
    }
  },
  function: {
    type: Schema.Types.ObjectId,
    ref: 'CellFunction'
  },
  next: {
    type: Number,
    required: true,
    min: 0,
    validate : {
      validator : Number.isInteger
    }
  }
}, {
  _id: false
});

const improvementsSchema = new Schema({
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

const eventSchema = new Schema({
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

const boardSchema = new Schema({
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

boardSchema.methods.addCellFunctions = async function(this: IBoardDocument) {
  const pathPieces = ['cells.', '.function'];
  for (let i = 0; i < this.cells.length; i++) {
    this.populate(pathPieces.join(i.toString()));
  }
  await this.execPopulate();
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

/**
 * Export section
 */

export interface IBoardInitializer extends IModelInitializer<IBoardModel, IBoardDocument> {}

let _modelName = 'Board';
let Board: IBoardModel;
let _connection: Connection | typeof mongoose;

const initializer: IBoardInitializer = {
  bindToConnection(connection, modelName = _modelName) {
    if (Board) {
      throw new TypeError('Board is already bound to connection');
    }
    _modelName = modelName;
    _connection = connection;
    Board = (connection as any).model(modelName, boardSchema);
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
}

export default initializer;