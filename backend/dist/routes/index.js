"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const users_route_1 = __importDefault(require("./users.route"));
const auth_route_1 = __importDefault(require("./auth.route"));
exports.apiRoutes = [];
exports.apiRoutes.push(auth_route_1.default, users_route_1.default);
//# sourceMappingURL=index.js.map