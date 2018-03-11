import KoaRouter from 'koa-router';
import { AuthController } from '../controllers/auth.controller';

const router = new KoaRouter({
  prefix: '/auth'
});

const controller = new AuthController();
router.post('/', controller.login);
router.get('/logout', controller.logout);
router.post('/register', controller.register);

export default router;