"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const board_model_1 = __importDefault(require("../models/board.model"));
const common_service_1 = require("./common.service");
let Board;
function initialize() {
    Board = board_model_1.default.getModel();
}
exports.initialize = initialize;
exports.findBoards = async (options) => {
    const filter = options.filter || {};
    const queryOptions = {};
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
        return await Board.find(filter, null, queryOptions);
    }
    catch (err) {
        common_service_1.rethrowError(err);
    }
};
exports.findBoard = async (id, populatePaths) => {
    let board;
    try {
        board = await Board.findById(id);
    }
    catch (err) {
        common_service_1.rethrowError(err);
    }
    if (!board) {
        throw new common_service_1.ServiceError('Invalid board id');
    }
    await board.extendedPopulate(populatePaths);
    return board;
};
//# sourceMappingURL=board.service.js.map