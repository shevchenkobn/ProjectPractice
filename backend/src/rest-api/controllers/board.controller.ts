import { Handler } from 'express';
import { getBoardsService, getBoardService, BoardServiceError } from '../services/board.service';
import { ClientRequestError } from '../../services/error-handler.service';

export const getBoards: Handler = async (req, res, next) => {
  try {
    const boards = await getBoardsService();
    res.json(boards);
  } catch (err) {
    if (err instanceof BoardServiceError) {
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

    const board = await getBoardService(id, addCellFunctions);
    res.json(board);
  } catch (err) {
    if (err instanceof BoardServiceError) {
      next(new ClientRequestError(err.message))
    } else {
      next(err);
    }
  }
};