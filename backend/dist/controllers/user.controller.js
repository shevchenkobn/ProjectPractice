"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserController {
    constructor() {
        this.getUsers = (ctx, next) => {
            ctx.body = [{
                    hello: 'world'
                }];
        };
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map