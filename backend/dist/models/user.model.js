"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    passwordHash: String,
    salt: String
}, {
    timestamps: true
});
mongoose_1.default.model('string', userSchema);
userSchema.virtual('password')
    .set(function (password) {
    this._password = password + '';
    if (this._password.length) {
        this.salt = bcrypt_1.default.genSaltSync();
        this.passwordHash = bcrypt_1.default.hashSync(this._password, this.salt);
    }
    else {
        this.salt = this.passwordHash = undefined;
    }
})
    .get(function () {
    return this._password;
});
userSchema.methods.checkPassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!password)
            return false;
        if (!this.passwordHash)
            return false;
        return (yield bcrypt_1.default.hash(password, this.salt)) === password;
    });
};
let User;
function bindUser(connection, modelName = 'User') {
    if (User) {
        throw new TypeError('User is already bound to connection');
    }
    User = connection.model(modelName, userSchema);
    return User;
}
exports.bindUser = bindUser;
function getUserModel() {
    if (!User) {
        throw new TypeError('User is not bound to connection');
    }
    return User;
}
exports.getUserModel = getUserModel;
//# sourceMappingURL=user.model.js.map