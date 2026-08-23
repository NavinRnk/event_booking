import { Request, Response } from 'express';
import { users } from '../models/index_models';
import { ApiError } from '../utils/ApiError';
import { signToken } from '../middlewares/verify-token';
import { writeLog } from '../utils/logger';

export const register = async (req: Request, res: Response) => {
  const { user_name, user_email_id, password, role } = req.body;

  const existing = await users.findOne({
    where: { user_email_id, is_deleted: false },
  });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const user = await users.create({
    user_name,
    user_email_id,
    password,
    role: role === 'admin' ? 'admin' : 'user',
    last_action: 'CREATE',
    is_deleted: false,
  });

  await user.update({ is_createdby: user.user_id, last_actionby: user.user_id });

  await writeLog({
    action: 'USER_REGISTERED',
    message: `New ${user.role} registered: ${user.user_email_id}`,
    user_id: user.user_id,
  });

  const token = signToken({ user_id: user.user_id, role: user.role });

  res.status(201).json({
    success: true,
    message: 'Registration successful.',
    data: { user: user.toSafeJSON(), token },
  });
};

export const login = async (req: Request, res: Response) => {
  const { user_email_id, password } = req.body;

  const user = await users.scope('withPassword').findOne({
    where: { user_email_id, is_deleted: false },
  });

  if (!user || !(await user.checkPassword(password))) {
    await writeLog({
      level: 'warn',
      action: 'LOGIN_FAILED',
      message: `Failed login attempt for ${user_email_id}`,
      details: { ip: req.ip },
    });
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = signToken({ user_id: user.user_id, role: user.role });

  await writeLog({
    action: 'LOGIN_SUCCESS',
    message: `${user.user_email_id} logged in`,
    user_id: user.user_id,
  });

  res.json({
    success: true,
    message: 'Login successful.',
    data: { user: user.toSafeJSON(), token },
  });
};

export const me = async (req: Request, res: Response) => {
  const user = await users.findOne({
    where: { user_id: req.user!.user_id, is_deleted: false },
  });
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  res.json({
    success: true,
    data: { user: user.toSafeJSON() },
  });
};
