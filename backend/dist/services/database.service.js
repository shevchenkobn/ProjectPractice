"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
exports.terminateSignal = 'SIGINT';
exports.reconnectTimeout = 5000;
let dbConnection;
let _config;
function initialize(config) {
    if (dbConnection) {
        return dbConnection;
    }
    _config = config;
    dbConnection = mongoose_1.default.createConnection(config.host + ':' + config.port + '/' + config.dbName);
    process.on(exports.terminateSignal, () => {
        dbConnection.close();
        process.kill(process.pid, exports.terminateSignal);
    });
    dbConnection.on('disconnect', () => {
        dbConnection = null;
        setTimeout(() => initialize(_config), exports.reconnectTimeout);
    });
    return dbConnection;
}
exports.initialize = initialize;
function getConnection() {
    if (!dbConnection) {
        throw new Error('Connection is not created!');
    }
    return dbConnection;
}
exports.getConnection = getConnection;
//# sourceMappingURL=database.service.js.map