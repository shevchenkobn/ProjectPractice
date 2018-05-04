
import CellFunctionInitializer, { ICellFunctionModel } from '../../models/cellFunction.model';
import { ServiceError } from './common.service';

const CellFunctionClass: ICellFunctionModel = CellFunctionInitializer.getModel();

export async function findCellFunction(id: string, addCellFunctionClass: boolean) {
  const cellFunction = await CellFunctionClass.findById(id);
  if (!cellFunction) {
    throw new ServiceError('Invalid cell function id');
  }
  if (cellFunction.class && addCellFunctionClass) {
    await cellFunction.populate('class').execPopulate();
  }
  return cellFunction;
}