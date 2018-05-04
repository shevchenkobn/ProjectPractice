import BoardInitializer, { IBoardModel, IBoardDocument } from '../../models/board.model';
import { ServiceError, rethrowError } from './common.service';

const Board: IBoardModel = BoardInitializer.getModel();

export const findBoards = (query: any, sort?: Array<string>, limit?: number, offset?: number): Promise<Array<IBoardDocument>> => {
  const options: any = {};
  if (sort) {
    options.sort = sort;
  }
  if (typeof limit === 'number') {
    options.limit = limit;
  }
  if (typeof offset === 'number') {
    options.skip = limit;
  }
  try {
    return <any>Board.find(query, null, options);
  } catch (err) {
    rethrowError(err);
  }
};

export const findBoard = async (id: string, addCellFunctions: boolean): Promise<IBoardDocument> => {
  const board = await Board.findById(id);
  if (!board) {
    throw new ServiceError('Invalid board id');
  }
  if (addCellFunctions) {
    await board.addCellFunctions();
  }
  return board;
};