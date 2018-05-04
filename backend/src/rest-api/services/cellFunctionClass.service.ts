
import CellFunctionClassInitializer, { ICellFunctionClassModel } from '../../models/cellFunctionClass.model';
import { ServiceError, rethrowError } from './common.service';

const CellFunctionClass: ICellFunctionClassModel = CellFunctionClassInitializer.getModel();

export async function findCellFunctionClass(id: string, addCellFunctions: boolean) {
  let cellFunctionClass;
  try {
    cellFunctionClass = await CellFunctionClass.findById(id);
  } catch (err) {
    rethrowError(err);
  }
  if (!cellFunctionClass) {
    throw new ServiceError('Invalid cell function class id');
  }
  if (addCellFunctions) {
    await cellFunctionClass.populate('functions').execPopulate();
  }
  return cellFunctionClass;
}