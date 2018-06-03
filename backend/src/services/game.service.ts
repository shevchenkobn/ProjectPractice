import GameModelInitializer, { IGameDocument, IGameModel, IGame } from '../models/game.model';
import { IFindManyOptions, rethrowError, ServiceError } from './common.service';
import { IBoardDocument } from '../models/board.model';
import { Types } from 'mongoose';
import { findBoard } from './board.service';
import config from 'config';
import { EventEmitter } from 'events';
import { ObjectID } from 'bson';
import { IUserDocument } from '../models/user.model';

export interface IGamesConfig {
  gamesPerUser: number,
  removeTimeout: number,
  startCountdown: number
}

export type RemoveEventHandler = (game: IGameDocument) => Promise<boolean>;

export let gamesConfig: IGamesConfig;
let Game: IGameModel;

export function initialize() {
  gamesConfig = config.get<IGamesConfig>('games');
  Game = GameModelInitializer.getModel();
}

export const findGames = async (options: IFindManyOptions): Promise<Array<IGameDocument> | Array<IGame>> => {
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
    const games: Array<IGameDocument> | Array<IGame> = await Game.find(filter, null, queryOptions);
    if (options.callToJSON) {
      for (let i = 0; i < games.length; i++) {
        games[i] = (games[i] as IGameDocument).toJSON();
      }
    }
    return games as Array<IGame>;
  } catch (err) {
    rethrowError(err);
  }
};

export const findGame = async (id: string | Types.ObjectId, populatePaths?: Array<string>, fromRequest: boolean = false): Promise<IGameDocument> => {
  let game;
  try {
    game = await Game.findById(id);
  } catch (err) {
    rethrowError(err);
  }
  if (!game) {
    throw new ServiceError('Invalid game id');
  }
  await game.extendedPopulate(populatePaths, fromRequest);
  return game;
};

export const removeGame = async (id: string, userId: string): Promise<void> => {
  const game = await findGame(id);
  if ((game.createdBy as ObjectID).toHexString() !== userId) {
    throw new ServiceError('You are didn\'t created the game so you are not able to delete it.');
  }
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
        // .then(err => console.log(err))//TODO: add loggin in error callback
        .catch(err => console.log(err));//TODO: add loggin in error callback
    }
    return newGame;
  } catch (err) {
    rethrowError(err);
  }
};

const removeTasks: {[objectId: string]: [NodeJS.Timer, RemoveEventHandler | never]} = {};

export const suspendRemoving = (game: IGameDocument, time: number): Promise<IGameDocument> => {
  if (!game) {
    throw new TypeError('Game is undefined');
  }
  const id = game.id;
  if (removeTasks[id]) {
    throw new TypeError(`Remove timeout for "${id}" is already set`);
  }
  const eventEmitter = new EventEmitter();
  removeTasks[id] = [setTimeout(async () => {
    stopSuspendedRemoving(id);
    const game = await findGame(id);
    if (!removeTasks[id][1] || await removeTasks[id][1](game)) {
      game.remove()
        .then((...args: Array<any>) => eventEmitter.emit('resolve', ...args))
        .catch((...args: Array<any>) => eventEmitter.emit('reject', ...args));
    } else {
      eventEmitter.emit('reject');
    }
  }, time), null];
  return new Promise<IGameDocument>((resolve, reject) => {
    eventEmitter.on('resolve', resolve);
    eventEmitter.on('reject', reject);
  });
}

export const stopSuspendedRemoving = (gameId: string): void => {
  if (!removeTasks[gameId]) {
    throw new Error(`No suspended removing is set for game id "${gameId}"`);
  }
  clearTimeout(removeTasks[gameId][0]);

  delete removeTasks[gameId];
}

export const changeRemovingCondition = (gameId: string, condition: RemoveEventHandler) => {
  if (!removeTasks[gameId]) {
    throw new Error('The game has no timeout for removing');
  } else if (removeTasks[gameId][1] && condition) {
    throw new Error('A removing condition is already set');
  }

  removeTasks[gameId][1] = condition;
}

export const hasRemovingCondition = (gameId: string) => {
  return !!removeTasks[gameId][1];
}