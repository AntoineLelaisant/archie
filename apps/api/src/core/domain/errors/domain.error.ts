import { AppError } from './app.error.js';

export class DomainError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 400);
  }
}
