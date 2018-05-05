"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_handler_service_1 = require("../../services/error-handler.service");
const common_service_1 = require("../../services/common.service");
const game_service_1 = require("../../services/game.service");
const getGames = async (req, res, next) => {
    try {
        const filterString = req.swagger.params.filter.value;
        const sort = req.swagger.params.sort.value || null;
        const offset = req.swagger.params.offset.value || 0;
        const limit = req.swagger.params.limit.value || 0;
        const filter = filterString ? common_service_1.prepareFilter(filterString) : {};
        const games = await game_service_1.findGames({
            filter,
            sort,
            limit,
            offset,
            lean: true
        });
        res.json(games);
    }
    catch (err) {
        if (err instanceof common_service_1.ServiceError) {
            next(new error_handler_service_1.ClientRequestError(err.message));
        }
        else {
            next(err);
        }
    }
};
const getGame = async (req, res, next) => {
    try {
        const id = req.swagger.params.boardId.value;
        const populate = req.swagger.params.populate;
        const game = await game_service_1.findGame(id, populate);
        res.json(game);
    }
    catch (err) {
        if (err instanceof common_service_1.ServiceError) {
            next(new error_handler_service_1.ClientRequestError(err.message));
        }
        else {
            next(err);
        }
    }
};
//# sourceMappingURL=game.controller.js.map