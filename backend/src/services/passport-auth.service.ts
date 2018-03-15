import passport from 'koa-passport';
import mongoose from 'mongoose';
import { Strategy as LocalStrategy } from 'passport-local';
import UserInitializer from '../models/user.model';

let User: any;
let initialized = false;

export function initialize(userModel: mongoose.Model<mongoose.Document> = UserInitializer.getModel()): typeof passport {
  if (initialized) {
    return passport;
  }
  User = userModel;
  passport.use('local', new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, new TypeError('Username is invalid'));
      }
      if (await user.checkPassword(password)) {
        done(null, user);
      } else {
        done(null, false, new TypeError('Password is invalid'));
      }
    } catch (err) {
      done(err);
    }
  }));

  passport.serializeUser<any, string>((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  initialized = true;
  return passport;
}