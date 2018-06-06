"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bson_1 = require("bson");
function getId(obj) {
    return obj instanceof Document ? obj.id : obj.toHexString();
}
exports.getId = getId;
async function ensureDocumentsArray(arr, retriever) {
    const promises = arr.map(obj => obj instanceof bson_1.ObjectId ? retriever(obj.toHexString()) : obj);
    return await Promise.all(promises);
}
exports.ensureDocumentsArray = ensureDocumentsArray;
//# sourceMappingURL=helpers.service.js.map