"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
var hapi_1 = __importDefault(require("hapi"));
var server = new hapi_1.default.Server({
    port: 3000,
    host: "127.0.0.1"
});
server.start().then(function () {
    console.log(server.info.uri);
});
server.route({
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
        reply.response("Hello, " + encodeURIComponent(request.params.name));
    }
});
//# sourceMappingURL=index.js.map