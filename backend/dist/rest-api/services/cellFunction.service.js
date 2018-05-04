"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cellFunction_model_1 = __importDefault(require("../../models/cellFunction.model"));
const common_service_1 = require("./common.service");
const CellFunctionClass = cellFunction_model_1.default.getModel();
async function findCellFunction(id, addCellFunctionClass) {
    const cellFunction = await CellFunctionClass.findById(id);
    if (!cellFunction) {
        throw new common_service_1.ServiceError('Invalid cell function id');
    }
    if (cellFunction.class && addCellFunctionClass) {
        await cellFunction.populate('class').execPopulate();
    }
    return cellFunction;
}
exports.findCellFunction = findCellFunction;
//# sourceMappingURL=cellFunction.service.js.map