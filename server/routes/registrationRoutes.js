import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { myRegistrations } from '../controllers/registrationController.js';

const router = Router();
router.get('/mine', protect, myRegistrations);
export default router;
