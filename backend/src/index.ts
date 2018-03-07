"use strict";
import KoaApplication from 'koa';
import KoaRouter, { IMiddleware } from 'koa-router';
import KoaBody from 'koa-body';
import path from 'path';

const app = new KoaApplication();
const router = new KoaRouter();
const uploadPath = path.resolve(__dirname, '../uploads');
const bodyParser = KoaBody({
  formidable: { uploadDir: uploadPath },
  multipart: true,
  urlencoded: true
});

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
}).post('/form', async (ctx, next) => {
  console.log(ctx.request.body);
  ctx.body = ctx.request.body;
});

app
  .use(bodyParser)
  .use(async (ctx, next) => { 
  })
  .use(router.routes())
  .use((ctx, next) => {
    if (ctx.status !== 404) return;
    ctx.redirect('/not_found');
  })
  .listen(3000, () => {
    console.log('listening');
  });