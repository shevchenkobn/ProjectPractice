"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authentication_service_1 = require("../../services/authentication.service");
const http_errors_1 = require("http-errors");
let authService;
let service;
const gameIdRegex = /^[a-f\d]{24}$/i;
function isUrlCorrect(url) {
    url = url.split('?')[0];
    const parts = url.split('/');
    url = parts[parts.length - 1] || parts[parts.length - 2];
    return gameIdRegex.test(url);
}
function getService() {
    if (service) {
        return service;
    }
    authService = authentication_service_1.getService();
    service = {
        checkAuthAndAccessMiddleware: async (socket, next) => {
            try {
                const req = socket.request;
                let state = authService.getState(req);
                if (!state) {
                    const token = authService.getToken(req);
                    state = await authService.getAuthStateFromToken(token);
                    if (!state) {
                        return next(new authentication_service_1.ClientAuthError("Invalid Token"));
                    }
                }
                if (!isUrlCorrect(req.url)) {
                    return next(new http_errors_1.NotFound());
                }
                // do something else
                next();
            }
            catch (err) {
                next(err);
            }
        }
    };
    return service;
}
exports.getService = getService;
//# sourceMappingURL=helpers.service.js.map