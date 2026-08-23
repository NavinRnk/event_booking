import { Request, Response, NextFunction } from 'express';

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
};

const BLOCKED_KEYS = ['__proto__', 'constructor', 'prototype'];

const escapeHtml = (value: string): string => {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
};

const isDangerousKey = (key: string): boolean => {
  return BLOCKED_KEYS.includes(key);
};

const clean = (value: any, depth = 0): any => {
  if (depth > 10) return null;

  if (typeof value === 'string') {
    return escapeHtml(value.trim());
  }

  if (Array.isArray(value)) {
    return value.map((item) => clean(item, depth + 1));
  }

  if (value !== null && typeof value === 'object') {
    if (value instanceof Date) return value;

    const result: Record<string, any> = Object.create(null);
    for (const key of Object.keys(value)) {
      if (isDangerousKey(key)) {
        console.warn('[sanitize] dropped suspicious key:', key);
        continue;
      }
      result[key] = clean(value[key], depth + 1);
    }
    return Object.assign({}, result);
  }

  return value;
};

export const sanitizeRequest = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) req.body = clean(req.body);
  if (req.params) req.params = clean(req.params);
  if (req.query && Object.keys(req.query).length > 0) {
    req.query = clean(req.query);
  }
  next();
};
