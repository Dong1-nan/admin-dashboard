import express from 'express';
import { LogController } from '../controllers/log.js';
import { authMiddleware, requireRole } from '../middlewares/auth.js';

const router = express.Router();
const logController = new LogController();

router.use(authMiddleware);
router.use(requireRole(['ADMIN']));

router.get('/', logController.getLogs);

export default router;