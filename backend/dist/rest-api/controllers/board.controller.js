"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const board_service_1 = require("../services/board.service");
const error_handler_service_1 = require("../../services/error-handler.service");
const common_service_1 = require("../services/common.service");
exports.getBoards = async (req, res, next) => {
    try {
        const filterString = req.swagger.params.filter.value;
        const sort = req.swagger.params.sort.value || null;
        const offset = req.swagger.params.offset.value || 0;
        const limit = req.swagger.params.limit.value || 0;
        const filter = filterString ? common_service_1.prepareFilter(filterString) : {};
        const boards = await board_service_1.findBoards(filter, {
            sort,
            limit,
            offset,
            lean: true
        });
        res.json(boards);
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
exports.getBoard = async (req, res, next) => {
    try {
        const id = req.swagger.params.boardId.value;
        const addCellFunctions = req.swagger.params.modifier && req.swagger.params.modifier.value === 'add-cell-functions';
        const board = await board_service_1.findBoard(id, addCellFunctions);
        res.json(board);
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
//# sourceMappingURL=board.controller.js.map