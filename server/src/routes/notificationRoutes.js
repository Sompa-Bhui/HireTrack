import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { listNotifications } from '../controllers/notificationController.js';

const router = Router();
router.get('/', protect, listNotifications);
export default router;
