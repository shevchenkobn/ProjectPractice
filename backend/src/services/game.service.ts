import GameModelInitializer, { IGameDocument, IGameModel } from '../models/game.model';
import { IFindManyOptions, rethrowError, ServiceError } from './common.service';
import { IBoardDocument } from '../models/board.model';
import { Types } from 'mongoose';
import { findBoard } from './board.service';
import config from 'config';
import { EventEmitter } from 'events';

export interface IGamesConfig {
  gamesPerUser: number,
  removeTimeout: number,
  startCountdown: number
}

let gamesConfig: IGamesConfig;
let Game: IGameModel;

export function initialize() {
  gamesConfig = config.get<IGamesConfig>('games');
  Game = GameModelInitializer.getModel();
}

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

export const findGame = async (id: string | Types.ObjectId, populatePaths?: Array<string>): Promise<IGameDocument> => {
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

export const constructAndSaveGame = async (boardId: string | Types.ObjectId, userId: string | Types.ObjectId, createSuspendedRemoving: boolean = true): Promise<IGameDocument> => {
  if (
    await Game.count({
      createdBy: userId,
      state: 'open'
    }) >= gamesConfig.gamesPerUser
  ) {
    throw new ServiceError(
      `The user "${userId}" has created maximum possible games (${gamesConfig.gamesPerUser})`
    );
  }
  await findBoard(boardId);
  try {
    const newGame = new Game({
      createdBy: userId,
      board: boardId
    });
    await newGame.save();
    if (createSuspendedRemoving) {
      suspendRemoving(newGame, gamesConfig.removeTimeout)
        .catch(err => console.log(err));//TODO: add loggin in error callback
    }
    return newGame;
  } catch (err) {
    rethrowError(err);
  }
};

const removeTimeouts: {[objectId: string]: NodeJS.Timer} = {};

export const suspendRemoving = (game: IGameDocument, time: number): Promise<IGameDocument> => {
  if (!game) {
    throw new TypeError('Game is undefined');
  }
  const id = game.id;
  if (removeTimeouts[id]) {
    throw new TypeError(`Remove timeout for "${id}" is already set`);
  }
  const eventEmitter = new EventEmitter();
  removeTimeouts[id] = setTimeout(() => {
    game.remove()
      .then((...args: Array<any>) => eventEmitter.emit('resolve', ...args))
      .catch((...args: Array<any>) => eventEmitter.emit('reject', ...args));
  }, time);
  return new Promise<IGameDocument>((resolve, reject) => {
    eventEmitter.on('resolve', resolve);
    eventEmitter.on('reject', reject);
  });
}

export const stopSuspendedRemoving = (gameId: string): void => {
  if (!removeTimeouts[gameId]) {
    throw new Error(`No suspended removing is set for game id "${gameId}"`);
  }
  clearInterval(removeTimeouts[gameId]);
}