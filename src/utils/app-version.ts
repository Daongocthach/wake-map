/**
 * Synced by scripts/sync-version.js.
 * Keep these values aligned with package.json and app.config.ts.
 */
export const VERSION = '1.0.0';
export const VERSION_PATCH = '1';

export function isVersionGreater(latestVersion: string, currentVersion: string): boolean {
  const latestParts = latestVersion.trim().replace(/^v/i, '').split('.').map(Number);
  const currentParts = currentVersion.trim().replace(/^v/i, '').split('.').map(Number);

  const maxLength = Math.max(latestParts.length, currentParts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const latestPart = latestParts[index] ?? 0;
    const currentPart = currentParts[index] ?? 0;

    if (latestPart > currentPart) {
      return true;
    }

    if (latestPart < currentPart) {
      return false;
    }
  }

  return false;
}
