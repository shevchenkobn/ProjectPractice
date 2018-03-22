"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_service_1 = require("../services/passport.service");
let readyRouter;
function initialize() {
    if (readyRouter) {
        return readyRouter;
    }
    const { jwtAuthenticate } = passport_service_1.getMiddlewares();
    const router = express_1.Router();
    router.get('/', jwtAuthenticate, (req, res, next) => {
        res.json(req.user);
    });
    readyRouter = {
        path: '/game',
        router: router
    };
    return readyRouter;
}
exports.initialize = initialize;
//# sourceMappingURL=game.route.js.map