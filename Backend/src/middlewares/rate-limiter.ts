import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const windowMs = env.rateLimit.windowMinutes * 60 * 1000;

export const generalLimiter = rateLimit({
  windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
});

export const authLimiter = rateLimit({
  windowMs,
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});
