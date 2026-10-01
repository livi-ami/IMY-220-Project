//error that carries an HTTP status code - caught in middeware and sent to client as JSON
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

//lets async route handlers throw errors and pass them to the error-handling middleware
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);