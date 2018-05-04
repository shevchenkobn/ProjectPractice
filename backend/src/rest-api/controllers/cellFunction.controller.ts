import { Handler } from 'express-serve-static-core';
import { findCellFunction } from '../services/cellFunction.service';
import { ServiceError } from '../services/common.service';
import { ClientRequestError } from '../../services/error-handler.service';

export const getCellFunction: Handler = async (req, res, next) => {
  try {
    const id = (<any>req).swagger.params.cellFunctionId.value as string;
    const addCellFunctionClass = (<any>req).swagger.params.modifier && (<any>req).swagger.params.modifier.value === 'add-cell-function-class';

    const cellFunction = await findCellFunction(id, addCellFunctionClass);
    res.json(cellFunction);
  } catch (err) {
    if (err instanceof ServiceError) {
      next(new ClientRequestError(err.message))
    } else {
      next(err);
    }
  }
};