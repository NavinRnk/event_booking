import { logs } from '../models/index_models';

interface LogInput {
  level?: string;
  action: string;
  message: string;
  user_id?: number;
  details?: Record<string, any>;
}

export const writeLog = async (input: LogInput): Promise<void> => {
  const level = input.level || 'info';
  console.log(`[${level}] ${input.action} - ${input.message}`);

  try {
    await logs.create({
      level,
      action: input.action,
      message: input.message,
      user_id: input.user_id ?? null,
      details: input.details ?? null,
    });
  } catch (err) {
    console.error('[logger] could not save log to MySQL:', (err as Error).message);
  }
};
