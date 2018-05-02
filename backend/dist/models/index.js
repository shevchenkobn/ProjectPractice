"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("./user.model"));
const session_model_1 = __importDefault(require("./session.model"));
const board_model_1 = __importDefault(require("./board.model"));
const cellFunction_model_1 = __importDefault(require("./cellFunction.model"));
const cellFunctionClass_model_1 = __importDefault(require("./cellFunctionClass.model"));
exports.models = null;
function initialize(connection) {
    if (exports.models) {
        throw new Error('Models are already initialized, import `models` instead');
    }
    exports.models = {
        [user_model_1.default.getModelName()]: user_model_1.default.bindToConnection(connection),
        [session_model_1.default.getModelName()]: session_model_1.default.bindToConnection(connection),
        [board_model_1.default.getModelName()]: board_model_1.default.bindToConnection(connection),
        [cellFunction_model_1.default.getModelName()]: cellFunction_model_1.default.bindToConnection(connection),
        [cellFunctionClass_model_1.default.getModelName()]: cellFunctionClass_model_1.default.bindToConnection(connection)
    };
    return exports.models;
}
exports.initialize = initialize;
//# sourceMappingURL=index.js.map