import express from 'express';
import { AuthController } from '../controllers/auth.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();
const authController = new AuthController();

// 公开路由
router.post('/login', authController.login);

// 需要认证的路由
router.get('/me', authMiddleware, authController.getCurrentUser);
router.put('/password', authMiddleware, authController.changePassword);

export default router;