import config from 'config';
import { IGamesConfig, findGames, suspendRemoving } from './game.service';
import { IGameDocument } from '../models/game.model';

export type IReviverFunction = () => void;

const gamesConfig = config.get<IGamesConfig>('games');

export async function getReviverFunction(): Promise<IReviverFunction> {
  const games = await findGames({
    filter: {
      state: 'open'
    }
  });
  const now = Date.now();
  const outdatedGames = [];
  const actualGames: Array<IGameDocument> = []
  for (let game of games) {
    if (now - +game.createdAt >= gamesConfig.removeTimeout) {
      outdatedGames.push(game.remove());
    } else {
      actualGames.push(game);
    }
  }
  await Promise.all(outdatedGames);

  return () => {
    const now = Date.now();
    for (let game of actualGames) {
      suspendRemoving(game, Math.max(0, now - +game.createdAt)).catch(err => console.log(err)); //TODO: add logging here
    }
  };
}