import { Handler } from 'express';
import { findBoards, findBoard } from '../services/board.service';
import { ClientRequestError } from '../../services/error-handler.service';
import { prepareFilter } from '../services/helper.service';
import { ServiceError } from '../services/common.service';

export const getBoards: Handler = async (req, res, next) => {
  try {
    const filterString = (<any>req).swagger.params.filter.value as string;
    const sort = (<any>req).swagger.params.sort.value || null;
    const offset = (<any>req).swagger.params.offset.value || 0;
    const limit = (<any>req).swagger.params.limit.value || 0;
    const filter = filterString ? prepareFilter(filterString) : {};

    const boards = await findBoards(filter, sort, limit, offset);
    res.json(boards);
  } catch (err) {
    if (err instanceof ServiceError) {
      next(new ClientRequestError(err.message))
    } else {
      next(err);
    }
  }
};

export const getBoard: Handler = async (req, res, next) => {
  try {
    const id = (<any>req).swagger.params.boardId.value as string;
    const addCellFunctions = (<any>req).swagger.params.modifier && (<any>req).swagger.params.modifier.value === 'add-cell-functions';

    const board = await findBoard(id, addCellFunctions);
    res.json(board);
  } catch (err) {
    if (err instanceof ServiceError) {
      next(new ClientRequestError(err.message))
    } else {
      next(err);
    }
  }
};