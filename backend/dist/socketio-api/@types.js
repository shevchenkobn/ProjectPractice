"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NspMiddlewareError {
    constructor(message, code) {
        this.message = {
            message
        };
        if (arguments.length > 1) {
            this.message.code = code;
        }
    }
}
exports.NspMiddlewareError = NspMiddlewareError;
//# sourceMappingURL=@types.js.map