import { describe, it, expect, vi, beforeAll } from 'vitest';

describe('Baseline Hardening', () => {
  beforeAll(() => {
    process.env.GEMINI_API_KEY = 'test-key';
    process.env.JWT_SECRET = 'test-secret-at-least-32-chars-long-for-warlord';
  });

  it('should have environment variables validated', async () => {
    const { env } = await import('./src/lib/env');
    expect(env.PORT).toBeDefined();
    expect(typeof env.PORT).toBe('number');
    expect(env.JWT_SECRET).toBe('test-secret-at-least-32-chars-long-for-warlord');
  });
});
