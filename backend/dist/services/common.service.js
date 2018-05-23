"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
class ServiceError extends Error {
}
exports.ServiceError = ServiceError;
class MongooseServiceError extends ServiceError {
    constructor(errObj, message) {
        super();
        const errPropsDict = errObj;
        for (const prop of Object.keys(errObj)) {
            this[prop] = errPropsDict[prop];
        }
        if (message) {
            this.message = message;
        }
    }
}
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
const unknownOperatorRegex = /unknown operator/i;
const cantUseOperatorRegex = /Can't use \$/i;
function rethrowError(err) {
    console.log(err.constructor);
    if (!(err instanceof Error)) {
        throw err;
    }
    else if (err.message == "sort() only takes 1 Argument") {
        throw new MongooseServiceError(err, 'Contradiction between sort fields');
    }
    else if (err instanceof mongoose_1.Error
        || objectIdRegex.test(err.message)
        || unknownOperatorRegex.test(err.message)
        || cantUseOperatorRegex.test(err.message)) {
        throw new MongooseServiceError(err);
    }
    else {
        throw err;
    }
}
exports.rethrowError = rethrowError;
//# sourceMappingURL=common.service.js.map