import mongoose from 'mongoose';
import bcrypt from 'bcrypt';


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
    transform(doc) {
      
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

userSchema.methods.checkPassword = async function (password: string) {
  if (!password) return false;
  if (!this.passwordHash) return false;
  return (await bcrypt.hash(password, this.salt)) === password;
}

let User: mongoose.Model<mongoose.Document>;
export function bindUser (connection: mongoose.Connection, modelName: string = 'User'): mongoose.Model<mongoose.Document> {
  if (User) {
    throw new TypeError('User is already bound to connection');
  }
  User = connection.model(modelName, userSchema);
  return User;
}

export function getUserModel() {
  if (!User) {
    throw new TypeError('User is not bound to connection');
  }
  return User;
}

