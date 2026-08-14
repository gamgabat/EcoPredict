import { describe, expect, it } from 'vitest';

describe('test harness', () => {
  it('is wired up and collecting tests', () => {
    expect(1 + 1).toBe(2);
  });
});
