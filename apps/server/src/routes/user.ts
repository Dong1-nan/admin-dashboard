import express from 'express';
import { UserController } from '../controllers/user.js';
import { authMiddleware, requireRole } from '../middlewares/auth.js';

const router = express.Router();
const userController = new UserController();

// 所有路由都需要认证 + ADMIN 角色
router.use(authMiddleware);
router.use(requireRole(['ADMIN']));

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;