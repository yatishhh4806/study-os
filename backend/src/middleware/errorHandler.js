import * as Sentry from "@sentry/node";

export class AppError extends Error {
  constructor(message, statusCode = 400, code = "BAD_REQUEST") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  const message =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "Something went wrong on our end."
      : err.message;

  if (statusCode === 500) {
    console.error("Unhandled error:", err);
    Sentry.captureException(err); // sends the real error to Sentry regardless of what the client sees
  }

  res.status(statusCode).json({
    error: message,
    code: err.code || "INTERNAL_ERROR",
  });
}