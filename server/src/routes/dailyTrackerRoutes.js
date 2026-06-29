import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getAnalytics, getToday, listHistory, upsertToday } from '../controllers/dailyTrackerController.js';

const router = Router();
router.use(protect);
router.get('/today', getToday);
router.post('/today', upsertToday);
router.get('/history', listHistory);
router.get('/analytics', getAnalytics);

export default router;
