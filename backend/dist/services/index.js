"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const board_service_1 = require("./board.service");
const game_service_1 = require("./game.service");
const cellFunction_service_1 = require("./cellFunction.service");
const cellFunctionClass_service_1 = require("./cellFunctionClass.service");
function initialize() {
    board_service_1.initialize();
    game_service_1.initialize();
    cellFunction_service_1.initialize();
    cellFunctionClass_service_1.initialize();
}
exports.initialize = initialize;
//# sourceMappingURL=index.js.map