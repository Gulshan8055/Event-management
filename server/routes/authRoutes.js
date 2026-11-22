import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, me } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many attempts. Try again in a few minutes' },
});

const router = Router();
router.post('/register', limiter, register);
router.post('/login', limiter, login);
router.get('/me', protect, me);
export default router;
