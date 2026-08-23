import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { users } from '../models/index_models';

export interface JwtPayload {
  user_id: number;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: number;
        role: string;
        user_name: string;
        user_email_id: string;
      };
    }
  }
}

const PUBLIC_ROUTES: { method: string; path: RegExp }[] = [
  { method: 'GET', path: /^\/$/ },
  { method: 'GET', path: /^\/api\/health$/ },
  { method: 'POST', path: /^\/api\/auth\/register$/ },
  { method: 'POST', path: /^\/api\/auth\/login$/ },
  { method: 'GET', path: /^\/api\/events$/ },
  { method: 'GET', path: /^\/api\/events\/\d+$/ },
];

const isPublic = (req: Request): boolean => {
  return PUBLIC_ROUTES.some(
    (route) => route.method === req.method && route.path.test(req.path)
  );
};

export const verifyToken = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (req.method === 'OPTIONS') {
      return next();
    }

    if (isPublic(req)) {
      return next();
    }

    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required. Send a "Bearer <token>" Authorization header.');
    }

    const token = header.split(' ')[1];

    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, env.jwt.secret) as JwtPayload;
    } catch {
      throw new ApiError(401, 'Invalid or expired token.');
    }

    const user = await users.findOne({
      where: { user_id: payload.user_id, is_deleted: false },
    });
    if (!user) {
      throw new ApiError(401, 'User belonging to this token no longer exists.');
    }

    req.user = {
      user_id: user.user_id,
      role: user.role,
      user_name: user.user_name,
      user_email_id: user.user_email_id,
    };

    next();
  } catch (err) {
    next(err);
  }
};

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn } as jwt.SignOptions);
};

export const adminOnly = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required.'));
  }
  if (req.user.role !== 'admin') {
    return next(new ApiError(403, 'Admin access required for this action.'));
  }
  next();
};
