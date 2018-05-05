import { Handler } from "express";
import { ClientRequestError } from '../../services/error-handler.service';
import { ServiceError, prepareFilter } from '../../services/common.service';
import { findGames, findGame } from "../../services/game.service";


const getGames: Handler = async (req, res, next) => {
  try {
    const filterString = (<any>req).swagger.params.filter.value as string;
    const sort = (<any>req).swagger.params.sort.value || null;
    const offset = (<any>req).swagger.params.offset.value || 0;
    const limit = (<any>req).swagger.params.limit.value || 0;
    const filter = filterString ? prepareFilter(filterString) : {};

    const games = await findGames({
      filter,
      sort,
      limit,
      offset,
      lean: true
    });
    res.json(games);
  } catch (err) {
    if (err instanceof ServiceError) {
      next(new ClientRequestError(err.message))
    } else {
      next(err);
    }
  }
}

const getGame: Handler = async (req, res, next) => {
  try {
    const id = (<any>req).swagger.params.boardId.value as string;
    const populate = (<any>req).swagger.params.populate;

    const game = await findGame(id, populate);
    res.json(game);
  } catch (err) {
    if (err instanceof ServiceError) {
      next(new ClientRequestError(err.message))
    } else {
      next(err);
    }
  }
}