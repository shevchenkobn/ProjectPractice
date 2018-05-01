import UserInitializer from './user.model';
import SessionInitializer from './session.model';
import BoardInitializer from './board.model';
import CellFunctionInitializer from './cellFunction.model';
import CellFunctionClassInitializer from './cellFunctionClass.model';
import mongoose from 'mongoose';

export interface IModelInitializer<IModel extends mongoose.Model<IDocument>, IDocument extends mongoose.Document> {
  bindToConnection(connection: mongoose.Connection | typeof mongoose, name?: string): IModel;
  getModel(): IModel;
  isBoundToConnection(connection?: mongoose.Connection | typeof mongoose): boolean;
  getModelName(): string;
}

export interface IModels {
  [name: string]: mongoose.Model<mongoose.Document>;
}

export let models: IModels = null;
export function initialize(connection: mongoose.Connection | typeof mongoose): IModels {
  if (models) {
    throw new Error('Models are already initialized, import `models` instead')
  }
  models = {
    [UserInitializer.getModelName()]: UserInitializer.bindToConnection(connection),
    [SessionInitializer.getModelName()]: SessionInitializer.bindToConnection(connection),
    [BoardInitializer.getModelName()]: BoardInitializer.bindToConnection(connection),
    [CellFunctionInitializer.getModelName()]: CellFunctionInitializer.bindToConnection(connection),
    [CellFunctionClassInitializer.getModelName()]: CellFunctionClassInitializer.bindToConnection(connection)
  };
  return models;
}