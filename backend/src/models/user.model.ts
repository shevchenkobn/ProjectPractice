import { IGoogleInfo } from './user.model';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { IModelInitializer } from './index';

export interface IUserDocument extends mongoose.Document {
  username: string;
  password?: string;
  passwordHash?: string;
  salt?: string;
  google?: IGoogleInfo;
  createdAt: Date;
  updatedAt: Date;
  checkPassword(password: string): boolean;
}

export interface IUserModel extends mongoose.Model<IUserDocument> {
  isConstructionObject(object: Object): boolean;
}

export interface IGoogleInfo {
  id: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  gender: 'male' | 'female';
  emails: Array<{
    value: string;
    type: 'account' | string;
  }>;
  photos: Array<{
    url: string
    isProfile: boolean;
    isDefault?: boolean;
  }>;
  profileUrl: string;
  organizations?: Array<{
    name: string;
    type: 'school' | string;
    endDate: string;
    primary: boolean;
  }>;
  placesLived?: Array<{
    value: string;
    primary: boolean;
  }>;
  isPlusUser: boolean;
  circledByCount: boolean;
  verified: boolean;
  domain?: string
}

const emailSchema = new mongoose.Schema({
  value: String,
  type: {
    type: String,
  }
}, {
  _id: false
});

const photoSchema = new mongoose.Schema({
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

const googleInfoSchema = new mongoose.Schema({
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

const userSchema = new mongoose.Schema({
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
  .set(function (password: string) {
    this._password = password + '';
    if (this._password.length) {
      this.salt = bcrypt.genSaltSync();
      this.passwordHash = bcrypt.hashSync(this._password, this.salt);
    } else {
      this.salt = this.passwordHash = undefined;
    }
  })
  .get(function() {
    return this._password;
  });

userSchema.methods.checkPassword = function (password: string) {
  if (!(password && this.passwordHash)) return false;
  return bcrypt.hashSync(password, this.salt) === this.passwordHash;
}

userSchema.static('isConstructionObject', function(object: any): any {
  return typeof object === 'object' && typeof object.username === 'string' && typeof object.password === 'string';
});

let _modelName = 'User';

/**
 * Export part
 */

let User: IUserModel;
let _connection: mongoose.Connection | typeof mongoose;

export interface IUserInitializer extends IModelInitializer<IUserModel, IUserDocument> {}

const initializer: IUserInitializer = {
  bindToConnection(connection: mongoose.Connection | typeof mongoose, modelName = _modelName) {
    if (User) {
      throw new TypeError('User is already bound to connection');
    }
    _modelName = modelName;
    _connection = connection;
    User = (connection as any).model(modelName, userSchema);
    return User;
  },

  getModel() {
    if (!User) {
      throw new TypeError('User is not bound to connection');
    }
    return User;
  },

  isBoundToConnection(connection = _connection): boolean {
    return User && connection === _connection;
  },

  getModelName() {
    return _modelName;
  }
};
export default initializer;