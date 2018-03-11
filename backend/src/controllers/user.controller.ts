import { Middleware } from "koa";


export class UserController {
  constructor(/*some stuff to inject here*/) {

  }

  public readonly getUsers: Middleware = (ctx, next) => {
    ctx.body = [{
      hello: 'world'
    }];
  }
}