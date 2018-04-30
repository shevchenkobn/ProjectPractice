import mongoose, { Schema, Connection, Model, Document } from 'mongoose';
import { IModelInitializer } from '.';

/**
 * Interfaces part
 */

export interface IImprovement {
  fee: number
}

export interface IOption {
  optionId: number
}

export interface ICellFunctionDocument extends Document {
  class: "event" | 'building' | 'modifier' | 'inventory',
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
 * Schema part
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

const optionSchema = new Schema({
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
    type: String,
    required: true,
    enum: ["event", 'building', 'modifier', 'inventory']
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
  timestamps: true
});

/**
 * Export part
 */

 export interface ICellFunctionInitializer extends IModelInitializer<ICellFunctionModel, ICellFunctionDocument> {}

let _modelName = 'CellFunction';
let CellFunction: ICellFunctionModel;
let _connection: Connection | typeof mongoose;

const initializer: ICellFunctionInitializer = {
  bindToConnection(connection, modelName = _modelName) {
    if (CellFunction) {
      throw new TypeError('Board is already bound to connection');
    }
    _modelName = modelName;
    _connection = connection;
    CellFunction = (connection as any).model(modelName, CellFunction);
    return CellFunction;
  },

  getModel() {
    if (!CellFunction) {
      throw new TypeError('Board is not bound to connection');
    }
    return CellFunction;
  },
  
  isBoundToConnection(connection = _connection) {
    return CellFunction && connection == _connection;
  },
  
  getModelName() {
    return _modelName;
  }
}