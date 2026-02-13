import { AppError } from './app.error.js';

export class InfrastructureError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 500);
  }
}
