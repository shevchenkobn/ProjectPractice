import KoaRouter from 'koa-router';
import usersRouter from './users.route';

export const apiRoutes: Array<KoaRouter> = [];

apiRoutes.push(usersRouter);
