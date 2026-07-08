import express from 'express';
import authRoutes from './auth.js';
import userRoutes from './user.js';
import logRoutes from './log.js';
import { UserController } from '../controllers/user.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();
const userController = new UserController();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/logs', logRoutes);

// Dashboard stats - 需要认证但不需要 ADMIN
router.get('/dashboard/stats', authMiddleware, userController.getStats);

export default router;