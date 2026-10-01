// An error that carries an HTTP status code. Thrown anywhere, caught by the error middleware.
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Lets async route handlers throw without try/catch in every route
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
