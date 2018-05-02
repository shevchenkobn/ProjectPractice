"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const board_service_1 = require("../services/board.service");
const error_handler_service_1 = require("../../services/error-handler.service");
exports.getBoards = async (req, res, next) => {
    try {
        const boards = await board_service_1.getBoardsService();
        res.json(boards);
    }
    catch (err) {
        if (err instanceof board_service_1.BoardServiceError) {
            next(new error_handler_service_1.ClientRequestError(err.message));
        }
        else {
            next(err);
        }
    }
};
exports.getBoard = async (req, res, next) => {
    try {
        const id = req.swagger.params.boardId.value;
        const addCellFunctions = req.swagger.params.modifier && req.swagger.params.modifier.value === 'add-cell-functions';
        const board = await board_service_1.getBoardService(id, addCellFunctions);
        res.json(board);
    }
    catch (err) {
        if (err instanceof board_service_1.BoardServiceError) {
            next(new error_handler_service_1.ClientRequestError(err.message));
        }
        else {
            next(err);
        }
    }
};
//# sourceMappingURL=board.controller.js.map