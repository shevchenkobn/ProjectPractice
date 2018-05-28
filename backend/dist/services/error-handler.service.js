"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = require("http-errors");
class ClientRequestError extends Error {
}
exports.ClientRequestError = ClientRequestError;
class AccessError extends Error {
}
exports.AccessError = AccessError;
exports.errorHandler = (err, req, res, next) => {
    const codeBySwagger = getCodeFromSwaggerError(err, req);
    if (codeBySwagger) {
        err.status = codeBySwagger;
        Object.defineProperties(err, {
            status: {
                enumerable: false,
            },
            message: {
                enumerable: true,
            }
        });
    }
    else if (err instanceof ClientRequestError) {
        err = new http_errors_1.BadRequest(err.message);
    }
    else if (err instanceof AccessError) {
        err = new http_errors_1.Forbidden(err.message);
    }
    else {
        err = new http_errors_1.InternalServerError(err.message);
    }
    console.error(err);
    res.status(err.status).json(err);
};
exports.notFoundHandler = (req, res) => {
    const err = new http_errors_1.NotFound();
    res.status(err.status).json(err);
};
// 0 is returned if not swagger error
const swaggerErrorRegex = /swagger/i;
function getCodeFromSwaggerError(err, req) {
    if (err.failedValidation) {
        return 400;
    }
    else if (swaggerErrorRegex.test(err.message)) {
        if (Array.isArray(err.allowedMethods)
            && err.allowedMethods.every(item => item != req.method)) {
            return 404;
        }
    }
    else {
        return 0;
    }
}
//# sourceMappingURL=error-handler.service.js.map