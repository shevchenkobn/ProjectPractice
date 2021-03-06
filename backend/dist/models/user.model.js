"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const emailSchema = new mongoose_1.default.Schema({
    value: String,
    type: {
        type: String,
    }
}, {
    _id: false
});
const photoSchema = new mongoose_1.default.Schema({
    url: {
        type: String,
        required: true
    },
    isProfile: {
        type: Boolean,
        required: true
    },
    isDefault: Boolean
}, {
    _id: false
});
const googleInfoSchema = new mongoose_1.default.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    displayName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        familyName: String,
        givenName: String
    },
    gender: {
        type: String,
        enum: ['male', 'female']
    },
    emails: [emailSchema],
    photos: [photoSchema],
    profileUrl: String,
    organizations: [{
            name: String,
            type: String,
            endDate: String,
            primary: String
        }],
    placesLived: [{
            value: String,
            primary: Boolean
        }],
    isPlusUser: Boolean,
    circledByCount: Boolean,
    verified: Boolean,
    domain: String
}, {
    _id: false
});
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    passwordHash: String,
    salt: String,
    google: googleInfoSchema
}, {
    timestamps: true,
    toObject: {
        transform(doc, ret) {
            return {
                id: doc.id,
                username: doc.username,
                google: doc.google
            };
        }
    }
});
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
    if (!(password && this.passwordHash))
        return false;
    return bcrypt_1.default.hashSync(password, this.salt) === this.passwordHash;
};
userSchema.static('isConstructionDoc', function (object) {
    return typeof object === 'object' && typeof object.username === 'string' && typeof object.password === 'string';
});
let _modelName = 'User';
/**
 * Export part
 */
let User;
let _connection;
const initializer = {
    bindToConnection(connection, modelName = _modelName) {
        if (User) {
            throw new TypeError('User is already bound to connection');
        }
        _modelName = modelName;
        _connection = connection;
        User = connection.model(modelName, userSchema);
        return User;
    },
    getModel() {
        if (!User) {
            throw new TypeError('User is not bound to connection');
        }
        return User;
    },
    isBoundToConnection(connection = _connection) {
        return User && connection === _connection;
    },
    getModelName() {
        return _modelName;
    }
};
exports.default = initializer;
//# sourceMappingURL=user.model.js.map