import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { IModelInitializer } from './index';

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
mongoose.model('string', userSchema);

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
  if (!password) return false;
  if (!this.passwordHash) return false;
  return bcrypt.hashSync(password, this.salt) === password;
}

let _modelName = 'User';

/**
 * Export part
 */

let User: mongoose.Model<mongoose.Document>;
let _connection: mongoose.Connection | typeof mongoose;

const initializer: IModelInitializer = {
  bindToConnection(connection: mongoose.Connection | typeof mongoose, modelName: string = _modelName): mongoose.Model<mongoose.Document> {
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

  isBoundToConnection(connection: mongoose.Connection | typeof mongoose = _connection): boolean {
    return User && connection === _connection;
  },

  getModelName() {
    return _modelName;
  }
};
export default initializer;