import type { Request, Response, NextFunction } from "express";

type HttpError = Error & { status?: number };

export function errorHandler(
  err: HttpError,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status ?? 500;
  const message = err.message || "Internal Server Error";

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ error: message });
}
