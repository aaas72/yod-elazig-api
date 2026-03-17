/**
 * Custom operational error class.
 * Throw this from services / controllers – the global error handler will
 * format the response automatically.
 */
class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: Array<{ field?: string; message: string }>;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, errors: Array<{ field?: string; message: string }> = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
