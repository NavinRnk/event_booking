import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { writeLog } from '../utils/logger';
import { env } from '../config/env';

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  let statusCode = 500;
  let message = 'Something went wrong on the server.';
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err?.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'A record with these details already exists.';
  } else if (err?.name === 'SequelizeValidationError') {
    statusCode = 422;
    message = 'Database validation failed.';
    details = err.errors?.map((e: any) => e.message);
  } else if (err?.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 409;
    message = 'This action conflicts with related records in the database.';
  } else if (err?.name === 'SequelizeDatabaseError') {
    statusCode = 400;
    message = 'The database rejected this request.';
  } else if (err?.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Request body is not valid JSON.';
  }

  void writeLog({
    level: statusCode >= 500 ? 'error' : 'warn',
    action: 'REQUEST_ERROR',
    message,
    user_id: req.user?.user_id,
    details: {
      path: req.originalUrl,
      method: req.method,
      statusCode,
      raw: err?.message,
    },
  });

  if (statusCode >= 500) {
    console.error('[error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { errors: details } : {}),
    ...(env.nodeEnv === 'development' && statusCode >= 500 ? { stack: err?.stack } : {}),
  });
};
