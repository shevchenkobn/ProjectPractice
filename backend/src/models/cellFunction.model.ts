import mongoose, { Schema, Connection, Model, Document } from 'mongoose';
import { IModelInitializer } from '.';
import { ICellFunctionClassDocument } from './cellFunctionClass.model';

/**
 * Interfaces section
 */

export interface IImprovement {
  fee: number
}

export interface IOption {
  [action: string]: any,
  optionId: number
}

export interface ICellFunctionDocument extends Document {
  class?: Schema.Types.ObjectId | ICellFunctionClassDocument
  event?: {
    triggers: Array<string>,
    action?: any
    options: Array<IOption>
  },
  building?: {
    price: number,
    fee: number,
    implements: Array<IImprovement>
  },
  modifier?: {
    actions: any,
    break: {
      triggers: Array<string>,
      action?: any
    }
  },
  inventory?: {
    action: any,
    sellable?: {
      price: number,
      priceFixed: boolean
    }
  }
}

export interface ICellFunctionModel extends Model<ICellFunctionDocument> {}

/**
 * Schema section
 */

const improvementSchema = new Schema({
  fee: {
    type: Number,
    min: 0,
    required: true
  }
}, {
  _id: false
});

const buildingSchema = new Schema({
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

const modifierSchema = new Schema({
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

const sellableSchema = new Schema({
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
})

const inventorySchema = new Schema({
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
})

const optionSchema = new Schema(<any>{
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

const eventSchema = new Schema({
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

const cellFunctionSchema = new Schema({
  class: {
    type: Schema.Types.ObjectId,
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

/**
 * Export section
 */

 export interface ICellFunctionInitializer extends IModelInitializer<ICellFunctionModel, ICellFunctionDocument> {}

let _modelName = 'CellFunction';
let CellFunction: ICellFunctionModel;
let _connection: Connection | typeof mongoose;

const initializer: ICellFunctionInitializer = {
  bindToConnection(connection, modelName = _modelName) {
    if (CellFunction) {
      throw new TypeError('CellFunction is already bound to connection');
    }
    _modelName = modelName;
    _connection = connection;
    CellFunction = (connection as any).model(modelName, cellFunctionSchema);
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
}

export default initializer;