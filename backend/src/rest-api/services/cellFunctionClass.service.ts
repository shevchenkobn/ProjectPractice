
import CellFunctionClassInitializer, { ICellFunctionClassModel } from '../../models/cellFunctionClass.model';
import { ServiceError } from './common.service';

const CellFunctionClass: ICellFunctionClassModel = CellFunctionClassInitializer.getModel();

export async function findCellFunctionClass(id: string, addCellFunctions: boolean) {
  const cellFunctionClass = await CellFunctionClass.findById(id);
  if (!cellFunctionClass) {
    throw new ServiceError('Invalid cell function class id');
  }
  if (addCellFunctions) {
    await cellFunctionClass.populate('functions').execPopulate();
  }
  return cellFunctionClass;
}