import { describe, expect, it } from '@jest/globals';
import { isVersionGreater } from './app-version';

describe('isVersionGreater', () => {
  it('returns true when latest version is newer', () => {
    expect(isVersionGreater('1.0.3', '1.0.2')).toBe(true);
  });

  it('returns false when latest version is older', () => {
    expect(isVersionGreater('1.0.1', '1.0.2')).toBe(false);
  });

  it('returns false when versions are equal', () => {
    expect(isVersionGreater('1.0.2', '1.0.2')).toBe(false);
  });

  it('compares numeric segments correctly', () => {
    expect(isVersionGreater('1.0.10', '1.0.2')).toBe(true);
  });
});
