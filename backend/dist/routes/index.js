"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_route_1 = require("./auth.route");
const game_route_1 = require("./game.route");
let apiRoutes;
function initialize() {
    if (apiRoutes) {
        return apiRoutes;
    }
    apiRoutes = [];
    apiRoutes.push(auth_route_1.initialize(), game_route_1.initialize());
    return apiRoutes;
}
exports.initialize = initialize;
//# sourceMappingURL=index.js.map