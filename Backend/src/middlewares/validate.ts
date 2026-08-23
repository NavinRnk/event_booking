import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export const validate = (rules: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const rule of rules) {
      await rule.run(req);
    }

    const result = validationResult(req);
    if (result.isEmpty()) {
      return next();
    }

    const errors = result.array().map((e: any) => ({
      field: e.path || e.param,
      message: e.msg,
    }));

    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors,
    });
  };
};
