import { Router } from 'express';
import { register, login, me } from '../controllers/auth.controller';
import { registerRules, loginRules } from '../validators/auth.validator';
import { validate } from '../middlewares/validate';

import { authLimiter } from '../middlewares/rate-limiter';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/register', authLimiter, validate(registerRules), asyncHandler(register));
router.post('/login', authLimiter, validate(loginRules), asyncHandler(login));
router.get('/me', asyncHandler(me));

export default router;
