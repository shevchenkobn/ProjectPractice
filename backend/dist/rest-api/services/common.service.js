"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ServiceError extends Error {
}
exports.ServiceError = ServiceError;
function prepareFilter(filterString) {
    try {
        return JSON.parse(filterString);
    }
    catch (err) {
        throw new ServiceError('Invalid filter string');
    }
}
exports.prepareFilter = prepareFilter;
const objectIdRegex = /objectid/i;
function rethrowError(err) {
    if (!(err instanceof Object)) {
        throw err;
    }
    else if (err.message == "sort() only takes 1 Argument") {
        throw new ServiceError('Contradiction between sort fields');
    }
    else if (objectIdRegex.test(err.message)) {
        throw new ServiceError(err.message);
    }
    else {
        throw err;
    }
}
exports.rethrowError = rethrowError;
//# sourceMappingURL=common.service.js.map