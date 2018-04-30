import { IModelInitializer } from './index';
import mongoose, { Schema, Connection, Model, Document } from 'mongoose';
import { IUserDocument } from './user.model';

/**
 * Interfaces part
 */

export interface ISessionDocument extends Document {
  user: Schema.Types.ObjectId | IUserDocument;
  gameId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'outdated';
}

export interface ISessionModel extends Model<ISessionDocument> {}

/**
 * Schema part
 */

const sessionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  game: {
    type: Schema.Types.ObjectId,
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
      }
    }
  }
});

/**
 * Export part
 */

let _modelName = 'Session';
let Session: ISessionModel;
let _connection: Connection | typeof mongoose;

export interface ISessionInitializer extends IModelInitializer<ISessionModel, ISessionDocument> {}

const initializer: ISessionInitializer = {
  bindToConnection(connection, modelName = _modelName) {
    if (Session) {
      throw new TypeError('User is already bound to connection');
    }
    _modelName = modelName;
    _connection = connection;
    Session = (connection as any).model(modelName, sessionSchema);
    return Session;
  },
  
  getModel() {
    if (!Session) {
      throw new TypeError('Session is not bound to connection');
    }
    return Session;
  },

  isBoundToConnection(connection = _connection) {
    return Session && connection === _connection;
  },

  getModelName() {
    return _modelName;
  }
}

export default initializer;