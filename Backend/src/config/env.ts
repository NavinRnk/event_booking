import dotenv from 'dotenv';

dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const optionalNumber = (key: string, fallback: number): number => {
  const value = process.env[key];
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const env = {
  port: optionalNumber('PORT', 5000),
  nodeEnv: process.env.NODE_ENV || 'development',

  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: optionalNumber('MYSQL_PORT', 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DB || 'event_ticket_db',
  },

  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },

  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0),

  rateLimit: {
    windowMinutes: optionalNumber('RATE_LIMIT_WINDOW_MIN', 15),
    max: optionalNumber('RATE_LIMIT_MAX', 100),
    authMax: optionalNumber('AUTH_RATE_LIMIT_MAX', 10),
  },
};
