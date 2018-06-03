
import CellFunctionInitializer, { ICellFunctionModel } from '../models/cellFunction.model';
import { ServiceError, rethrowError } from './common.service';

let CellFunctionClass: ICellFunctionModel;

export function initialize() {
  CellFunctionClass = CellFunctionInitializer.getModel()
}

export async function findCellFunction(id: string, populate?: Array<string>) {
  let cellFunction;
  try {
    cellFunction = await CellFunctionClass.findById(id);
  } catch (err) {
    rethrowError(err);
  }
  if (!cellFunction) {
    throw new ServiceError('Invalid cell function id');
  }
  if (cellFunction.class && Array.isArray(populate) && populate.includes('class')) {
    await cellFunction.populate('class').execPopulate();
  }
  return cellFunction;
}