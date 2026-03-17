import { Response } from 'express';

/**
 * Standardised API response wrapper.
 */
class ApiResponse<T = unknown> {
  public readonly success: boolean;
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data: T | null;

  constructor(statusCode: number, message: string, data: T | null = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  /** Convenience: send the response via Express res object */
  send(res: Response): Response {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }
}

export default ApiResponse;
