import { IModelInitializer } from './index';
import { Types, Schema, Connection, Model, Document } from 'mongoose';
import mongoose from 'mongoose';
import { IUserDocument } from './user.model';
import { IBoardDocument } from './board.model';
import { ICellFunctionDocument } from './cellFunction.model';

/**
 * Interfaces section
 */

export interface IPlayerDocument {
  user: Types.ObjectId | IUserDocument,
  role?: Types.ObjectId | ICellFunctionDocument,
  status: 'active' | 'gone',
  dateLeft?: Date,
  cash: number,
  assets: number,
  depts: {
    bank: number,
    [playerIndex: number]: number
  },
  cellId: number,
  possessions: Array<Schema.Types.ObjectId | ICellFunctionDocument>,
  monopolies?: {[objectId: string]: boolean},// if monopoly is active
  modifiers: Array<Schema.Types.ObjectId | ICellFunctionDocument>,
  mortgaged: Array<Schema.Types.ObjectId | ICellFunctionDocument>
}

export interface IGameDocument extends Document {
  createdBy: Types.ObjectId | IUserDocument,
  state: 'open' | 'playing' | 'finished',
  board: Types.ObjectId | IBoardDocument,
  winner?: Types.ObjectId | IUserDocument,
  stepCount: number,
  playerIndex: number,
  players: Array<IPlayerDocument>
}

export interface IGameModel extends Model<IGameDocument> {}

/**
 * Schema section
 */

const playerSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  role: { 
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'CellFunction'
  },
  status: {
    type: String,
    required: true,
    enum: [
      'active',
      'gone'
    ],
    default: 'active'
  },
  dateLeft: {
    type: Date,
    required: false
  },
  cash: {
    type: Number,
    required: true,
    default: 0
  },
  assets: {
    type: Number,
    required: true,
    default: 0
  },
  depts: {
    type: {},
    required: false
  },
  cellId: {
    type: Number,
    required: true,
    default: 0
  },
  possessions: {//FIXME: inventory for now is included here
    type: [{type: Schema.Types.ObjectId, ref: 'CellFunction'}],
    required: true,
    default: []
  },
  monopolies: {
    type: {},
    required: false
  },
  modifiers: {//TODO: to be included in cellFunctions
    type: [{type: Schema.Types.ObjectId, ref: 'CellFunction'}],
    required: true,
  },
  mortgaged: {
    type: [{type: Schema.Types.ObjectId, ref: 'CellFunction'}],
    required: true
  }
}, {
  _id: false
});

const gameSchema = new Schema({
  createdBy: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  state: {
    type: String,
    required: true,
    enum: [
      'open',
      'playing',
      'finished'
    ],
    default: 'open'
  },
  board: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Board"
  },
  winner: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'User'
  },
  stepCount: {
    type: Number,
    min: 0,
    default: 0,
  },
  playerIndex: {
    type: Number,
    min: 0,
    default: 0,
  },
  players: {
    type: [playerSchema],
    required: true,
    default: []
  }
}, {
  timestamps: true,
  collection: 'games'
});

/**
 * Export section
 */

export interface IGameModelInitializer extends IModelInitializer<IGameModel, IGameDocument> {}

let _modelName = 'Game';
let Game: IGameModel;
let _connection: Connection | typeof mongoose;

const initializer: IGameModelInitializer = {
  bindToConnection(connection, modelName = _modelName) {
    if (Game) {
      throw new TypeError('Game model is already bound to connection');
    }
    _modelName = modelName;
    _connection = connection;
    Game = (connection as any).model(modelName, gameSchema);
    return Game;
  },

  getModel() {
    if (!Game) {
      throw new TypeError('Game model is not bound to connection');
    }
    return Game;
  },
  
  isBoundToConnection(connection = _connection) {
    return Game && _connection && connection == _connection;
  },
  
  getModelName() {
    return _modelName;
  }
}

export default initializer;

