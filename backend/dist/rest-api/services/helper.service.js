"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_service_1 = require("./common.service");
function prepareFilter(filterString) {
    try {
        return JSON.parse(filterString, (key, value) => {
            if ((value instanceof Object) && !Array.isArray(value)) {
                const keys = Object.keys(value);
                if (keys.length === 1 && keys[0] === '$date') {
                    return new Date(value.$date);
                }
            }
            return value;
        });
    }
    catch (err) {
        throw new common_service_1.ServiceError('Invalid filter string');
    }
}
exports.prepareFilter = prepareFilter;
//# sourceMappingURL=helper.service.js.map