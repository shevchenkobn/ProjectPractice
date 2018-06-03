import { IModelInitializer } from './index';
import { Types, Schema, Connection, Model, Document } from 'mongoose';
import mongoose from 'mongoose';
import { IUserDocument } from './user.model';
import { IBoardDocument } from './board.model';
import { ICellFunctionDocument } from './cellFunction.model';
import { ISessionDocument } from './session.model';

/**
 * Interfaces section
 */

export interface IPlayerDocument {
  session: Types.ObjectId | ISessionDocument,
  user: Types.ObjectId | IUserDocument,
  role?: Types.ObjectId | ICellFunctionDocument,
  status: 'waiting' | 'active' | 'gone',
  whenGone?: Date,
  cash: number,
  assets: number,
  depts?: {
    bank: number,
    [playerIndex: number]: number
  },
  cellId: number,
  possessions: Array<Schema.Types.ObjectId | ICellFunctionDocument>,
  monopolies?: { [objectId: string]: boolean },// if monopoly is active
  modifiers: Array<Schema.Types.ObjectId | ICellFunctionDocument>,
  mortgaged: Array<Schema.Types.ObjectId | ICellFunctionDocument>,
  otherInfo?: any
}

export interface IGame {
  createdBy: Types.ObjectId | IUserDocument,
  status: 'open' | 'playing' | 'finished',
  board: Types.ObjectId | IBoardDocument,
  winner?: Types.ObjectId | IUserDocument,
  stepCount: number,
  playerIndex: number,
  players: Array<IPlayerDocument>,
  otherInfo: any,

  createdAt: Date,
  updatedAt: Date,
}

export interface IGameDocument extends Document, IGame {
  extendedPopulate(paths: Array<string>, fromRequest?: boolean): Promise<void>
}

export interface IGameModel extends Model<IGameDocument> { }

/**
 * Schema section
 */

const playerSchema = new Schema({
  session: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Session'
  },
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
      'waiting',
      'active',
      'gone'
    ],
    default: 'waiting'
  },
  whenGone: {
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
    type: [{ type: Schema.Types.ObjectId, ref: 'CellFunction' }],
    required: true,
    default: []
  },
  monopolies: {
    type: {},
    required: false
  },
  modifiers: {//TODO: to be included in cellFunctions
    type: [{ type: Schema.Types.ObjectId, ref: 'CellFunction' }],
    required: true,
    default: []
  },
  mortgaged: {
    type: [{ type: Schema.Types.ObjectId, ref: 'CellFunction' }],
    required: true,
    default: []
  },
  otherInfo: {
    type: Object,
    required: false
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
  status: {
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
  },
  otherInfo: {
    type: Object,
    required: false
  }
}, {
  timestamps: true,
  collection: 'games',
  toObject: {
    transform(doc: IGameDocument, ret: IGame, options) {
      for (let player of ret.players) {
        delete player.session;
      }
      return ret;
    }
  }
});

gameSchema.methods.extendedPopulate = async function (this: IGameDocument, paths: Array<string>, fromRequest: boolean = false): Promise<void> {
  if (!(Array.isArray(paths) && paths.length)) {
    return;
  }
  const hasBoard = paths.includes('board');
  if (hasBoard) {
    this.populate('board');
  }
  if (paths.includes('createdBy')) {
    this.populate('createdBy');
  }
  if (this.players.length) {
    const playersPopulate = paths.filter(value => value.startsWith('players'));
    if (playersPopulate.length) {
      const populateUsers = playersPopulate.includes('players.users');
      const populateSessions = !fromRequest && playersPopulate.includes('players.sessions');
      const populateRole = playersPopulate.includes('players.roles');
      const populatePossessions = playersPopulate.includes('players.possessions');
      const populateModifiers = playersPopulate.includes('players.modifiers');
      const populateMortgaged = playersPopulate.includes('players.mortgaged');
      for (let i = 0; i < this.players.length; i++) {
        if (populateUsers) {
          this.populate('players.' + i + '.user');
        }
        if (!fromRequest && populateSessions) {
          this.populate('players.' + i + '.session');
        }
        if (populateRole) {
          this.populate('players.' + i + '.role');
        }
        if (populatePossessions) {
          this.populate('players.' + i + '.posessions');
        }
        if (populateModifiers) {
          this.populate('players.' + i + '.modifiers');
        }
        if (populateMortgaged) {
          this.populate('players.' + i + '.mortgaged');
        }
      }
    }
  }
  await this.execPopulate();
  if (hasBoard) {
    const boardPopulate = [];
    if (paths.includes('board.cellFunctions')) {
      boardPopulate.push('cellFunctions');
    }
    if (paths.includes('board.roles')) {
      boardPopulate.push('roles');
    }
    await (this.board as IBoardDocument).extendedPopulate(boardPopulate);
  }
};

/**
 * Export section
 */

export interface IGameModelInitializer extends IModelInitializer<IGameModel, IGameDocument> { }

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

