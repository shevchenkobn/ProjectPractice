import { Middleware } from 'koa';
import passport from '../services/passport-auth.service';
import { getUserModel } from '../models/user.model';

const User = getUserModel();
export class AuthController {
  register: Middleware = async (ctx, next) => {
    try {
      let user = await User.findOne({username: ctx.request.body.username});
      if (!user) {
        user = new User(ctx.request.body);
        await user.save();
      }
      await ctx.login(user);
    } catch (err) {
      (ctx.app as any).emit('error', err, ctx);
    }
  }
  login: Middleware = passport.authenticate('local', {});
  logout: Middleware = (ctx, next) => {
    ctx.logout();
    next();
  }
}