import { IModelInitializer } from './index';
import { Types, Schema, Connection, Model, Document } from 'mongoose';
import mongoose from 'mongoose';
import { ICellFunctionDocument } from './cellFunction.model';

/**
 * Interfaces section
 */
export interface IRange {
  min?: number,
  max: number
}

export interface IBoardEvent {
  type: string
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
    "playerLimits": {
      min: number,
      max: number
    },
    "roles": Array<ICellFunctionDocument | Types.ObjectId>,
    "dices": Array<IRange>,
    "building": {
      "mortgage": {
        "price": number,
        monopoly: boolean,
        improvements: boolean,
        "liftInterestPercent"?: number,
        "sell": {
          "pricePercentPay"?: number
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
  "cells": Array<IBoardCell>,
  extendedPopulate(paths: Array<string>, poolEntities?: boolean): Promise<void>;
  extendedPopulated(paths: Array<string>): { [path: string]: boolean };
}

export interface IBoardModel extends Model<IBoardDocument> { }

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
    validate: {
      validator: Number.isInteger
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
    validate: {
      validator: Number.isInteger
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
  type: {
    type: String,
    required: true,
  },
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
    "playerLimits": {
      type: {
        max: {
          type: Number,
          required: true,
          min: 2
        },
        min: {
          type: Number,
          required: true,
          min: 2
        }
      },
      required: true,
    },
    "roles": {
      type: [{ type: Schema.Types.ObjectId, ref: 'CellFunction' }],
      required: false,
      default: []
    },
    "dices": [rangeSchema],
    "building": {
      "mortgage": {
        "price": {
          type: Number,
          required: true
        },
        "monopoly": {
          type: Boolean,
          required: true
        },
        "improvements": {
          type: Boolean,
          required: true
        },
        "liftInterestPercent": Number,
        "sell": {
          "pricePercentPay": Number
        }
      },
      "improvements": {
        type: improvementsSchema,
        required: true
      },
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

boardSchema.methods.extendedPopulate = async function (this: IBoardDocument, paths: Array<string>, poolEntities = true) {
  if (!(paths && paths.length)) {
    return;
  }
  const hasCellFunctions = paths.includes('cellFunctions');
  const pathPieces = ['cells.', '.function'];
  let sharedIDs: { [objectId: string]: Array<number> };
  if (hasCellFunctions) {
    if (poolEntities) {
      sharedIDs = {};
      for (let i = 0; i < this.cells.length; i++) {
        if (!(this.cells[i].function && (this.cells[i].function as Types.ObjectId).toHexString)) {
          continue;
        }
        const id = (this.cells[i].function as Types.ObjectId).toHexString();
        const path = pathPieces.join(i.toString());
        if (!this.populated(path)) {
          if (sharedIDs[id]) {
            sharedIDs[id].push(i);
          } else {
            this.populate(path);
            sharedIDs[id] = [i];
          }
        }
      }
    } else {
      for (let i = 0; i < this.cells.length; i++) {
        const path = pathPieces.join(i.toString());
        if (!this.populated(path)) {
          this.populate(pathPieces.join(i.toString()));
        }
      }
    }
  }
  if (paths.includes('roles') && !this.populated('roles')) {
    this.populate('roles');
  }
  await this.execPopulate();
  if (hasCellFunctions && poolEntities) {
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

boardSchema.methods.extendedPopulated = function (this: IBoardDocument, paths: Array<string>): { [path: string]: boolean } {
  if (!(paths && paths.length)) {
    return {};
  }
  const populated: { [path: string]: boolean } = paths.reduce((obj, path) => (obj as any)[path] = false, {});
  const cellFunctionsIndex = paths.indexOf('cellFunctions');
  const pathPieces = ['cells.', '.function'];
  let sharedIDs: { [objectId: string]: Array<number> };
  if (~cellFunctionsIndex) {
    paths.splice(cellFunctionsIndex, 1);

    for (let i = 0; i < this.cells.length; i++) {
      const path = pathPieces.join(i.toString());
      if (!this.populated(path)) {
        populated.cellFunctions = false;
        break;
      } else {
        populated.cellFunctions = true;
      }
    }
  }
  for (let path of paths) {
    populated[path] = this.populated(path);
  }
  return populated;
};

/**
 * Export section
 */

export interface IBoardInitializer extends IModelInitializer<IBoardModel, IBoardDocument> { }

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