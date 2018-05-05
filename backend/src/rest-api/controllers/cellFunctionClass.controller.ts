import { Handler } from 'express-serve-static-core';
import { findCellFunctionClass } from '../../services/cellFunctionClass.service';
import { ServiceError } from '../../services/common.service';
import { ClientRequestError } from '../../services/error-handler.service';

export const getCellFunctionClass: Handler = async (req, res, next) => {
  try {
    const id = (<any>req).swagger.params.cellFunctionClassId.value as string;
    const populate = (<any>req).swagger.params.populate.value;

    const cellFunctionClass = await findCellFunctionClass(id, populate);
    res.json(cellFunctionClass);
  } catch (err) {
    if (err instanceof ServiceError) {
      next(new ClientRequestError(err.message))
    } else {
      next(err);
    }
  }
};