import { describe, it, expect } from 'vitest';
import { APP_NAME, APP_VERSION } from './app.constants.js';

describe('App Constants', () => {
  it('should export APP_NAME', () => {
    expect(APP_NAME).toBe('Archie');
  });

  it('should export APP_VERSION', () => {
    expect(APP_VERSION).toBe('0.0.1');
  });
});
