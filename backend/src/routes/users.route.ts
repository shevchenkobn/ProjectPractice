import KoaRouter from 'koa-router';
import { UserController } from '../controllers/user.controller';

const router = new KoaRouter({
  prefix: '/users'
});
const controller = new UserController();

router.get('/', controller.getUsers);

export default router;