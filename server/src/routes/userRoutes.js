import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { changePassword, deleteAccount, getMe, updateProfile } from '../controllers/userController.js';

const router = Router();
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/me/password', protect, changePassword);
router.delete('/me', protect, deleteAccount);
export default router;
