"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ServiceError extends Error {
}
exports.ServiceError = ServiceError;
function rethrowError(err) {
    if (err.message == "sort() only takes 1 Argument") {
        throw new ServiceError('Contradiction between sort fields');
    }
    else {
        throw err;
    }
}
exports.rethrowError = rethrowError;
//# sourceMappingURL=common.service.js.map