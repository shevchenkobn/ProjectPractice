"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const board_model_1 = __importDefault(require("../../models/board.model"));
const common_service_1 = require("./common.service");
const Board = board_model_1.default.getModel();
exports.findBoards = (query, sort, limit, offset) => {
    const options = {};
    if (sort) {
        options.sort = sort;
    }
    if (typeof limit === 'number') {
        options.limit = limit;
    }
    if (typeof offset === 'number') {
        options.skip = limit;
    }
    try {
        return Board.find(query, null, options);
    }
    catch (err) {
        common_service_1.rethrowError(err);
    }
};
exports.findBoard = async (id, addCellFunctions) => {
    const board = await Board.findById(id);
    if (!board) {
        throw new common_service_1.ServiceError('Invalid board id');
    }
    if (addCellFunctions) {
        await board.addCellFunctions();
    }
    return board;
};
//# sourceMappingURL=board.service.js.map