import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { createResume, deleteResume, listResumes } from '../controllers/resumeController.js';

const router = Router();
router.use(protect);
router.get('/', listResumes);
router.post('/', createResume);
router.delete('/:id', deleteResume);
export default router;
