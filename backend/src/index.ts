"use strict";
import KoaApplication from 'koa';
import KoaRouter, {IMiddleware} from 'koa-router';
import KoaBody from 'koa-body';

const app = new KoaApplication();
const router = new KoaRouter();
const bodyParser = KoaBody();

router.all('/test', async (ctx, next) => {
  ctx.body = "all test";
  next();
}).all('/not_found', (ctx, next) => {
  ctx.body = "sorry, not fjou";
}).all('/error', async (ctx, next) => {
  try {
    // throw new Error('oh shi-');
  } catch (err) {
    ctx.throw('Msg', 500);
    // ctx.status = err.status || 500;
    // ctx.body = err.message;
    // ctx.app.emit('error', err, ctx);
  }
  next();
});

app
.use(router.routes())
.use((ctx, next) => {
  if (ctx.status !== 404) return;
  ctx.redirect('/not_found');
})
.listen(3000, () => {
  console.log('listening');
});