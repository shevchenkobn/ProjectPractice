import { SocketHandler } from '../@types';
import { IGameDocument } from '../../models/game.model';
import { ServiceError } from '../../services/common.service';
import { IBoardDocument } from '../../models/board.model';
import { IUserDocument } from '../../models/user.model';
import { stopSuspendedRemoving, changeConditionOnRemoving, RemoveCondition } from '../../services/game.service';
import { ISessionDocument } from '../../models/session.model';
import { ObjectID } from 'bson';

const currentGames: { [gameId: string]: IGameDocument } = {};

export const connectionHandler: SocketHandler = socket => {
  console.log(socket);
}

export async function joinGame(game: IGameDocument, session: ISessionDocument) {
  if (game.state !== 'open') {
    throw new ServiceError('The game room is not open');
  } 
  await game.populate('board').execPopulate();
  if (game.players.length === (game.board as IBoardDocument).rules.playerLimits.max) {
    throw new ServiceError('The game room is full');
  } else if (session.game) {
    throw new ServiceError('The user has already joined some game under this session');
  }
  game.players.push(<any>{
    user: session.user,
    status: 'active'
  });
  session.game = game.id;
  if (await tryStartGame(game)) {
    stopSuspendedRemoving(game.id);
  } else {
    changeConditionOnRemoving(game.id, suspendedRemovingCondition);
  }
  await game.save();
  await session.save();
}

async function tryStartGame(game: IGameDocument): Promise<boolean> {
  if (!game.populated('board')) {
    await game.populate('board').execPopulate();
  }
  if (game.players.length === (game.board as IBoardDocument).rules.playerLimits.max) {
    game.state = 'playing';

    currentGames[game.id] = game;
    return true;
    // TODO: start game
  } else {
    return false;
  }
}

const suspendedRemovingCondition: RemoveCondition = async (game) => {
  if (!await tryStartGame(game)) {
    return false;
  } else {
    const promises = [];
    if (game.players.length) {
      for (let i = 0; i < game.players.length; i++) {
        if (game.players[i].session instanceof ObjectID) {
          await game.populate('players.' + i + '.user').execPopulate();
        }
        // TODO: add players disconnecting
        const session = game.players[i].session as ISessionDocument;
        session.game = null;
        promises.push(session.save());
      }
      await Promise.all(promises);
    }

    return true;
  }
}