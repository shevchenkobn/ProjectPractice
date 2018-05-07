"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cellFunctionClass_model_1 = __importDefault(require("../models/cellFunctionClass.model"));
const common_service_1 = require("./common.service");
let CellFunctionClass;
function initialize() {
    CellFunctionClass = cellFunctionClass_model_1.default.getModel();
}
exports.initialize = initialize;
async function findCellFunctionClass(id, populate) {
    let cellFunctionClass;
    try {
        cellFunctionClass = await CellFunctionClass.findById(id);
    }
    catch (err) {
        common_service_1.rethrowError(err);
    }
    if (!cellFunctionClass) {
        throw new common_service_1.ServiceError('Invalid cell function class id');
    }
    if (populate && Array.isArray(populate) && populate.includes('functions')) {
        await cellFunctionClass.populate('functions').execPopulate();
    }
    return cellFunctionClass;
}
exports.findCellFunctionClass = findCellFunctionClass;
//# sourceMappingURL=cellFunctionClass.service.js.map