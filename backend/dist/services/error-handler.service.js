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
    if (err instanceof ClientRequestError) {
        err = new http_errors_1.BadRequest(err.message);
    }
    else if (err instanceof AccessError) {
        err = new http_errors_1.Forbidden(err.message);
    }
    else {
        err = new http_errors_1.InternalServerError(err.message);
    }
    res.status(err.status).json(err);
};
//# sourceMappingURL=error-handler.service.js.map