"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
class App {
    constructor(routes) {
        this._app = new koa_1.default();
        this._routers = routes;
        for (let route of routes) {
            this._app.use(route.routes());
        }
    }
    listen(port) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return this._app.listen(port);
            }
            catch (err) {
                return err;
            }
        });
    }
}
exports.App = App;
//# sourceMappingURL=app.js.map