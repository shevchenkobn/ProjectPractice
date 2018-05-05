import GameModelInitializer, { IGameDocument } from '../models/game.model';
import { IFindManyOptions, rethrowError, ServiceError } from './common.service';
import { IBoardDocument } from '../models/board.model';

const Game = GameModelInitializer.getModel();

export const findGames = async (options: IFindManyOptions): Promise<Array<IGameDocument>> => {
  const filter = options.filter || {};
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
    return await Game.find(filter, null, queryOptions);
  } catch (err) {
    rethrowError(err);
  }
}

export const findGame = async (id: string, populatePaths?: Array<string>): Promise<IGameDocument> => {
  let game;
  try {
    game = await Game.findById(id);
  } catch (err) {
    rethrowError(err);
  }
  if (!game) {
    throw new ServiceError('Invalid game id');
  }
  await game.extendedPopulate(populatePaths);
  return game;
}