"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NspMiddlewareError {
    constructor(message, code) {
        this.message = {
            message
        };
        if (code) {
            this.message.code = code;
        }
    }
}
exports.NspMiddlewareError = NspMiddlewareError;
//# sourceMappingURL=@types.js.map