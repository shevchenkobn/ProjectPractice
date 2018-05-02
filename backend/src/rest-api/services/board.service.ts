import BoardInitializer, { IBoardModel, IBoardDocument } from '../../models/board.model';

const Board: IBoardModel = BoardInitializer.getModel();

export class BoardServiceError extends Error {}

export const getBoardsService = async (): Promise<Array<IBoardDocument>> => {
  return await Board.find();
};

export const getBoardService = async (id: string, addCellFunctions: boolean): Promise<IBoardDocument> => {
  const board = await Board.findById(id);
  if (!board) {
    throw new BoardServiceError('Invalid board id');
  }
  if (addCellFunctions) {
    await board.addCellFunctions();
  }
  return board;
};