import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const correlationId = req.correlationId;

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Request payload failed validation schema',
      details: err.errors,
      correlationId,
    });
    return;
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal Server Error' : 'Request Error',
    message,
    correlationId,
  });
}
