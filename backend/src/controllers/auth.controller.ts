import { Middleware } from 'koa';
import passport from '../services/passport-auth.service';
import { getUserModel } from '../models/user.model';

const User = getUserModel();
export class AuthController {
  register: Middleware = async (ctx, next) => {
    let user = await User.findOne({username: ctx.request.body.username});
    if (!user) {
      user = new User(ctx.request.body);
      await user.save();
    } else {
      ctx.throw(400, "Username is occupied");
    }
  }
  login: Middleware = async (ctx, next) => {
    const user = await User.findOne({username: ctx.request.body.username});
    await ctx.login(user);
  }
  logout: Middleware = (ctx, next) => {
    ctx.logout();
    next();
  }
}