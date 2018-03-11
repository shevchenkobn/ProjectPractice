"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const swagger = __importStar(require("swagger2"));
const config_1 = __importDefault(require("config"));
const dot_prop_1 = __importDefault(require("dot-prop"));
const configureProps = [
    [
        (host, port) => {
            return host + ':' + port;
        },
        ['host', 'port'],
        'host'
    ],
    ['apiPath', 'basePath']
];
function loadSwaggerDocument(filePath) {
    const document = swagger.loadDocumentSync(filePath);
    if (!swagger.validateDocument(document)) {
        throw new TypeError(`${filePath} does not conform to the Swagger 2.0 schema`);
    }
    for (let propConf of configureProps) {
        if (Array.isArray(propConf)) {
            if (typeof propConf[0] === 'function') {
                const params = [];
                for (let prop of propConf[1]) {
                    params.push(config_1.default.get(prop));
                }
                dot_prop_1.default.set(document, propConf[2], propConf[0](...params));
            }
            else {
                dot_prop_1.default.set(document, propConf[1], config_1.default.get(propConf[0]));
            }
        }
        else {
            dot_prop_1.default.set(document, propConf, config_1.default.get(propConf));
        }
    }
    return document;
}
exports.loadSwaggerDocument = loadSwaggerDocument;
//# sourceMappingURL=swagger.service.js.map