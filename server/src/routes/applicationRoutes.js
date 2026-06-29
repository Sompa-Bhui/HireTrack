import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { analytics, archiveApplication, createApplication, deleteApplication, duplicateApplication, getAchievements, getSourceAnalytics, getStats, listApplications, updateApplication, updateGoal } from '../controllers/applicationController.js';

const router = Router();
router.use(protect);
router.get('/', listApplications);
router.get('/analytics', analytics);
router.get('/stats', getStats);
router.get('/sources', getSourceAnalytics);
router.get('/achievements', getAchievements);
router.patch('/goal', updateGoal);
router.post('/', createApplication);
router.post('/:id/duplicate', duplicateApplication);
router.patch('/:id/archive', archiveApplication);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);
export default router;
