import KoaRouter from 'koa-router';
import usersRouter from './users.route';
import authRouter from './auth.route';

export const apiRoutes: Array<KoaRouter> = [];

apiRoutes.push(authRouter, usersRouter);
