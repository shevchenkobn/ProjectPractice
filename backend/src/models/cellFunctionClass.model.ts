import mongoose, { Schema, Connection, Model, Document } from 'mongoose';
import { IModelInitializer } from '.';
import { ICellFunctionDocument } from './cellFunction.model';

/**
 * Interfaces section
 */

export interface ICellFunctionClassDocument extends Document {
  type: 'building',
  functions: Array<Schema.Types.ObjectId> | Array<ICellFunctionDocument>,
  descriptor: {
    improvements?: {
      price: number
    },
    price?: number,
    feeDescriptor?: any
  }
}

export interface ICellFunctionClassModel extends Model<ICellFunctionClassDocument> {}

/**
 * Schema section
 */

const feeDescriptorSchema = new Schema({
  type: {
    type: String,
    required: false
  }
}, {
  _id: false
});

const improvementsSchema = new Schema({
  price: {
    type: Number,
    min: 0,
    required: true
  }
}, {
  _id: false
})

const cellFunctionClassSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['building']
  },
  functions: {
    type: [{type: [Schema.Types.ObjectId], ref: 'CellFunction'}],
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
});

/**
 * Export section
 */

 export interface ICellFunctionClassInitializer extends IModelInitializer<ICellFunctionClassModel, ICellFunctionClassDocument> {}

let _modelName = 'CellFunctionClass';
let CellFunctionClass: ICellFunctionClassModel;
let _connection: Connection | typeof mongoose;

const initializer: ICellFunctionClassInitializer = {
  bindToConnection(connection, modelName = _modelName) {
    if (CellFunctionClass) {
      throw new TypeError('CellFunctionClass is already bound to connection');
    }
    _modelName = modelName;
    _connection = connection;
    CellFunctionClass = (connection as any).model(modelName, cellFunctionClassSchema);
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
}

export default initializer;