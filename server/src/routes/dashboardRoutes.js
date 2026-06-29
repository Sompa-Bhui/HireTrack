import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getDashboard } from '../controllers/dashboardController.js';

const router = Router();
router.get('/', protect, getDashboard);
export default router;
