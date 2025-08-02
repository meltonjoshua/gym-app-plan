export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public data?: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.data = data;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
