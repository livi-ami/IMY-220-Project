import { HttpError } from "../utils/errors.js";

export const notFound = (req, res, next) => next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));

export const errorHandler = (err, req, res, next) => {
  if (err.type === "entity.parse.failed") err = new HttpError(400, "Request body is not valid JSON.");
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({
    success: false,
    message: status === 500 ? "Something went wrong on the server." : err.message,
    ...(err.details && { details: err.details }),
  });
};
