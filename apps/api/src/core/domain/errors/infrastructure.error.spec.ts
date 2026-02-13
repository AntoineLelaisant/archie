import { describe, it, expect } from 'vitest';
import { AppError } from './app.error.js';
import { InfrastructureError } from './infrastructure.error.js';

describe('InfrastructureError', () => {
  it('should create an infrastructure error with code and message', () => {
    const error = new InfrastructureError('DB_CONNECTION_FAILED', 'Cannot connect to database');

    expect(error.code).toBe('DB_CONNECTION_FAILED');
    expect(error.message).toBe('Cannot connect to database');
    expect(error.httpStatus).toBe(500);
    expect(error.name).toBe('InfrastructureError');
  });

  it('should extend AppError', () => {
    const error = new InfrastructureError('TEST', 'test');

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(InfrastructureError);
    expect(error).toBeInstanceOf(Error);
  });

  it('should always set httpStatus to 500', () => {
    const error = new InfrastructureError('REDIS_TIMEOUT', 'Redis connection timed out');

    expect(error.httpStatus).toBe(500);
  });
});
