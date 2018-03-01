"use strict";
import KoaApplication from 'koa';
import KoaRouter, {IMiddleware} from 'koa-router';

const app = new KoaApplication();
const router = new KoaRouter();

const get: IMiddleware = (ctx, next) => {
  ctx.body = "Hello, World";
};
const post: IMiddleware = (ctx, next) => {
  ctx.body = "Post hello";
};

router.get('/:name/:id([0-9]{0,5})', (ctx) => {
  ctx.body = ctx.params.name + ' with ' + ctx.params.id;
});
router.get('/hello', get);
router.post('/hello', post);
router.all('/test', (ctx, next) => {
  ctx.body = "all test";
});

app.use(router.routes())
.listen(3000, () => {
  console.log('listening');
});