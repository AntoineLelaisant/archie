import { describe, it, expect } from 'vitest';
import { AppError } from './app.error.js';
import { DomainError } from './domain.error.js';

describe('DomainError', () => {
  it('should create a domain error with code and message', () => {
    const error = new DomainError('DOCUMENT_NOT_FOUND', 'Document non trouvé');

    expect(error.code).toBe('DOCUMENT_NOT_FOUND');
    expect(error.message).toBe('Document non trouvé');
    expect(error.httpStatus).toBe(400);
    expect(error.name).toBe('DomainError');
  });

  it('should extend AppError', () => {
    const error = new DomainError('TEST', 'test');

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);
  });

  it('should always set httpStatus to 400', () => {
    const error = new DomainError('VALIDATION_ERROR', 'Invalid input');

    expect(error.httpStatus).toBe(400);
  });
});
