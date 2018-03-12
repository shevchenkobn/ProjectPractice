import passport  from 'koa-passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { getUserModel } from '../models/user.model';

const User: any = getUserModel();
passport.use('local', new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({username});
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

export default passport;