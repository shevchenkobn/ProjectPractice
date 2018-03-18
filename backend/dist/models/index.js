"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("./user.model"));
const session_model_1 = __importDefault(require("./session.model"));
let models = null;
function initialize(connection) {
    if (models) {
        return models;
    }
    models = {
        [user_model_1.default.getModelName()]: user_model_1.default.bindToConnection(connection),
        [session_model_1.default.getModelName()]: session_model_1.default.bindToConnection(connection)
    };
    return models;
}
exports.initialize = initialize;
//# sourceMappingURL=index.js.map