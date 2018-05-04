"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cellFunctionClass_service_1 = require("../services/cellFunctionClass.service");
const common_service_1 = require("../services/common.service");
const error_handler_service_1 = require("../../services/error-handler.service");
exports.getCellFunctionClass = async (req, res, next) => {
    try {
        const id = req.swagger.params.cellFunctionClassId.value;
        const addCellFunctions = req.swagger.params.modifier && req.swagger.params.modifier.value === 'add-cell-functions';
        const cellFunctionClass = await cellFunctionClass_service_1.findCellFunctionClass(id, addCellFunctions);
        res.json(cellFunctionClass);
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
//# sourceMappingURL=cellFunctionClass.controller.js.map