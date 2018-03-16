import { IModelInitializer } from './index';
import mongoose, { Schema, Connection, Model, Document } from 'mongoose';

const sessionSchema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  gameId: {
    type: Schema.Types.ObjectId,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'outdated'],
    default: 'active',
    required: true,
  }
}, {
  timestamps: true
});

/**
 * Export part
 */

let _modelName = 'Session';
let Session: Model<Document>;
let _connection: Connection | typeof mongoose;

const initializer: IModelInitializer = {
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