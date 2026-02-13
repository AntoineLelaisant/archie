import { describe, it, expect } from 'vitest';
import { AppError } from './app.error.js';

describe('AppError', () => {
  it('should create an error with code and message', () => {
    const error = new AppError('TEST_ERROR', 'Something went wrong');

    expect(error.code).toBe('TEST_ERROR');
    expect(error.message).toBe('Something went wrong');
    expect(error.httpStatus).toBeUndefined();
    expect(error.name).toBe('AppError');
    expect(error).toBeInstanceOf(Error);
  });

  it('should create an error with optional httpStatus', () => {
    const error = new AppError('NOT_FOUND', 'Resource not found', 404);

    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Resource not found');
    expect(error.httpStatus).toBe(404);
  });

  it('should be an instance of Error', () => {
    const error = new AppError('TEST', 'test');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });
});
