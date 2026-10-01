//an error that carries an HTTP status code - caught by the errorHandler middleware and returned to the client
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

//lets async route handlers throw without try/catch in every route
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
