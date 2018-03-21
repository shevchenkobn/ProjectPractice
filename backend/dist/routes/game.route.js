"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const express_1 = require("express");
let readyRouter;
function initialize() {
    if (readyRouter) {
        return readyRouter;
    }
    const router = express_1.Router();
    router.get('/', (req, res, next) => passport_1.default.authenticate('jwt', function (err, state, info) {
        if (err) {
            next(err);
        }
        if (!state) {
            next(info);
        }
        req.user;
        next();
    })(req, res, next), (req, res, next) => {
        res.json(req.user);
    });
    router.get('/g', passport_1.default.authenticate('google', async function () {
        console.log(arguments);
        debugger;
    }));
    router.get('/g/callback', passport_1.default.authenticate('google', async function () {
        console.log(arguments);
        debugger;
    }));
    readyRouter = {
        path: '/game',
        router: router
    };
    return readyRouter;
}
exports.initialize = initialize;
//# sourceMappingURL=game.route.js.map