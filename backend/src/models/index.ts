import UserInitializer from './user.model';
import SessionInitializer from './session.model';
import mongoose from 'mongoose';

let models: IModels = null;
export function initialize(connection: mongoose.Connection | typeof mongoose): IModels {
  if (models) {
    return models;
  }
  models = {
    [UserInitializer.getModelName()]: UserInitializer.bindToConnection(connection),
    [SessionInitializer.getModelName()]: UserInitializer.bindToConnection(connection)
  };
  return models;
}

export interface IModelInitializer {
  bindToConnection(connection: mongoose.Connection | typeof mongoose, name?: string): mongoose.Model<mongoose.Document>;
  getModel(): mongoose.Model<mongoose.Document>;
  isBoundToConnection(connection?: mongoose.Connection | typeof mongoose): boolean;
  getModelName(): string;
}

export interface IModels {
  [name: string]: mongoose.Model<mongoose.Document>;
}