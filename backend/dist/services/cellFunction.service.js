"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cellFunction_model_1 = __importDefault(require("../models/cellFunction.model"));
const common_service_1 = require("./common.service");
let CellFunctionClass;
function initialize() {
    CellFunctionClass = cellFunction_model_1.default.getModel();
}
exports.initialize = initialize;
async function findCellFunction(id, populate) {
    let cellFunction;
    try {
        cellFunction = await CellFunctionClass.findById(id);
    }
    catch (err) {
        common_service_1.rethrowError(err);
    }
    if (!cellFunction) {
        throw new common_service_1.ServiceError('Invalid cell function id');
    }
    if (cellFunction.class && Array.isArray(populate) && populate.includes('class')) {
        await cellFunction.populate('class').execPopulate();
    }
    return cellFunction;
}
exports.findCellFunction = findCellFunction;
//# sourceMappingURL=cellFunction.service.js.map