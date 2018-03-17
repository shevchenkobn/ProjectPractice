import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { IModelInitializer } from './index';
import passport from 'koa-passport';

export interface IUserDocument extends mongoose.Document {
  username: string;
  password?: string;
  salt?: string;
  createdAt: Date;
  updatedAt: Date;
  checkPassword(password: string): boolean;
}

export interface IUserModel extends mongoose.Model<IUserDocument> {
  isRegistrable(object: any): boolean;
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  passwordHash: String,
  salt: String
}, {
  timestamps: true,
  toObject: {
    transform(doc, ret) {
      return {
        _id: ret._id,
        username: ret.username  
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

userSchema.static('isRegistrable', function(object: any): any {
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