import { Handler } from 'express-serve-static-core';
import { findCellFunctionClass } from '../../services/cellFunctionClass.service';
import { ServiceError } from '../../services/common.service';
import { ClientRequestError } from '../../services/error-handler.service';

export const getCellFunctionClass: Handler = async (req, res, next) => {
  try {
    const id = (<any>req).swagger.params.cellFunctionClassId.value as string;
    const addCellFunctions = (<any>req).swagger.params.modifier && (<any>req).swagger.params.modifier.value === 'add-cell-functions';

    const cellFunctionClass = await findCellFunctionClass(id, addCellFunctions);
    res.json(cellFunctionClass);
  } catch (err) {
    if (err instanceof ServiceError) {
      next(new ClientRequestError(err.message))
    } else {
      next(err);
    }
  }
};