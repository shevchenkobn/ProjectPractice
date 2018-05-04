import BoardInitializer, { IBoardModel, IBoardDocument } from '../../models/board.model';
import { ServiceError, rethrowError, IFindManyOptions } from './common.service';

const Board: IBoardModel = BoardInitializer.getModel();

export const findBoards = async (filter: any, options: IFindManyOptions): Promise<Array<IBoardDocument>> => {
  // const query = Board.find(filter);
  const queryOptions: any = {};
  if (Array.isArray(options.sort)) {
    queryOptions.sort = options.sort;
  }
  if (typeof options.limit === 'number') {
    queryOptions.limit = options.limit;
  }
  if (typeof options.offset === 'number') {
    queryOptions.skip = options.offset;
  }
  if (options.lean) {
    queryOptions.lean = options.lean;
  }
  try {
    return await Board.find(filter, null, queryOptions);
  } catch (err) {
    rethrowError(err);
  }
};

export const findBoard = async (id: string, addCellFunctions: boolean): Promise<IBoardDocument> => {
  let board;
  try {
    board = await Board.findById(id);
  } catch (err) {
    rethrowError(err);
  }
  if (!board) {
    throw new ServiceError('Invalid board id');
  }
  if (addCellFunctions) {
    await board.addCellFunctions();
  }
  return board;
};