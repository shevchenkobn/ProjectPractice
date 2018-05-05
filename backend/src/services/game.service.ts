import GameModelInitializer, { IGameDocument } from '../models/game.model';
import { IFindManyOptions, rethrowError, ServiceError } from './common.service';
import { IBoardDocument } from '../models/board.model';
import { Types } from 'mongoose';
import { findBoard } from './board.service';

const gamesPerUser = 3;
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
};

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
};

export const removeGame = async (id: string): Promise<void> => {
  const game = await findGame(id);
  if (game.players.length) {
    throw new ServiceError('There are players connected to the game. Delete is impossible.');
  }
  await game.remove();
};

export const constructAndSaveGame = async (boardId: string, userId: string): Promise<IGameDocument> => {
  if (
    await Game.count({
      createdBy: userId,
      state: 'open'
    }) >= gamesPerUser
  ) {
    throw new ServiceError(
      `The user "${userId}" has created maximum possible games (${gamesPerUser})`
    );
  }
  await findBoard(boardId);
  try {
    const newGame = new Game({
      createdBy: userId,
      board: boardId
    });
    await newGame.save();
    return newGame;
  } catch (err) {
    rethrowError(err);
  }
}