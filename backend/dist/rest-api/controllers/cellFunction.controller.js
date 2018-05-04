"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cellFunction_service_1 = require("../services/cellFunction.service");
const common_service_1 = require("../services/common.service");
const error_handler_service_1 = require("../../services/error-handler.service");
exports.getCellFunction = async (req, res, next) => {
    try {
        const id = req.swagger.params.cellFunctionId.value;
        const addCellFunctionClass = req.swagger.params.modifier && req.swagger.params.modifier.value === 'add-cell-function-class';
        const cellFunction = await cellFunction_service_1.findCellFunction(id, addCellFunctionClass);
        res.json(cellFunction);
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
//# sourceMappingURL=cellFunction.controller.js.map