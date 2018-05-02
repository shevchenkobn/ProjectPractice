"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const board_model_1 = __importDefault(require("../../models/board.model"));
const Board = board_model_1.default.getModel();
class BoardServiceError extends Error {
}
exports.BoardServiceError = BoardServiceError;
exports.getBoardsService = async () => {
    return await Board.find();
};
exports.getBoardService = async (id, addCellFunctions) => {
    const board = await Board.findById(id);
    if (!board) {
        throw new BoardServiceError('Invalid board id');
    }
    if (addCellFunctions) {
        await board.addCellFunctions();
    }
    return board;
};
//# sourceMappingURL=board.service.js.map