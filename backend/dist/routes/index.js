"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_route_1 = require("./auth.route");
let apiRoutes;
function getRoutes() {
    if (apiRoutes) {
        return apiRoutes;
    }
    apiRoutes = [];
    apiRoutes.push(auth_route_1.initialize());
    return apiRoutes;
}
exports.getRoutes = getRoutes;
//# sourceMappingURL=index.js.map