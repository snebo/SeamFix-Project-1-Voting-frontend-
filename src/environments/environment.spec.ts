import { describe, it, expect } from 'vitest';
import { environment } from './environment';

describe('Environment Configuration', () => {
  it('should have a valid apiUrl', () => {
    expect(environment.apiUrl).toBeDefined();
    expect(typeof environment.apiUrl).toBe('string');
    expect(environment.apiUrl.length).toBeGreaterThan(0);
  });

  it('should have a production flag', () => {
    expect(environment.production).toBeDefined();
    expect(typeof environment.production).toBe('boolean');
  });
});
