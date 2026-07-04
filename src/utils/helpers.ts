import { z } from 'zod/v4';
import { env } from '@/config/env';
import { getItem, removeItem, setItem, STORAGE_KEYS } from '@/utils/storage';
import type { StorageResult } from '@/utils/storage/types';

/**
 * Filters out parameters that are undefined, null, or empty strings.
 * This is useful for cleaning query parameters before sending API requests.
 */
export function cleanParams(
  params: Record<string, unknown>
): Record<string, string | number | boolean> {
  const cleaned: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value as string | number | boolean;
    }
  }
  return cleaned;
}

export function resolveTokenColor(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

const defaultApiBaseUrl = normalizeApiBaseUrl(env.apiBaseUrl);
const apiBaseUrlSchema = z.string().trim().url();
const defaultSocketUrl = normalizeSocketUrl(env.socketUrl);
const defaultVersionJsonUrl = normalizeUrl(
  'https://apifinetags.finepro.net/mobile-app/android/heattreatment/version.json'
);
const urlSchema = z.string().trim().url();

function isWebSocketUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'ws:' || parsed.protocol === 'wss:';
  } catch {
    return false;
  }
}

function normalizeUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

export function normalizeApiBaseUrl(value: string): string {
  return normalizeUrl(value);
}

export function normalizeSocketUrl(value: string): string {
  return normalizeUrl(value);
}

export function normalizeVersionJsonUrl(value: string): string {
  return normalizeUrl(value);
}

export function getDefaultApiBaseUrl(): string {
  return defaultApiBaseUrl;
}

export function getDefaultSocketUrl(): string {
  return defaultSocketUrl;
}

export function getDefaultVersionJsonUrl(): string {
  return defaultVersionJsonUrl;
}

export function getApiBaseUrl(): string {
  const stored = getItem<string>(STORAGE_KEYS.preferences.apiBaseUrl);

  if (!stored.success || !stored.data) {
    return defaultApiBaseUrl;
  }

  const normalized = normalizeApiBaseUrl(stored.data);
  return apiBaseUrlSchema.safeParse(normalized).success ? normalized : defaultApiBaseUrl;
}

export function setApiBaseUrl(value: string): StorageResult<string> {
  const normalized = normalizeApiBaseUrl(value);
  const parsed = apiBaseUrlSchema.safeParse(normalized);

  if (!parsed.success) {
    return {
      success: false,
      error: new Error('Invalid API base URL'),
    };
  }

  return setItem(STORAGE_KEYS.preferences.apiBaseUrl, parsed.data);
}

export function getSocketUrl(storedValue?: string | null): string {
  const rawValue =
    storedValue ??
    ((): string | null => {
      const stored = getItem<string>(STORAGE_KEYS.preferences.socketUrl);

      if (!stored.success || !stored.data) {
        return null;
      }

      return stored.data;
    })();

  if (!rawValue) {
    return defaultSocketUrl;
  }

  const normalized = normalizeSocketUrl(rawValue);
  return isWebSocketUrl(normalized) ? normalized : defaultSocketUrl;
}

export function getVersionJsonUrl(): string {
  const stored = getItem<string>(STORAGE_KEYS.preferences.versionJsonUrl);

  if (!stored.success || !stored.data) {
    return defaultVersionJsonUrl;
  }

  const normalized = normalizeVersionJsonUrl(stored.data);
  return urlSchema.safeParse(normalized).success ? normalized : defaultVersionJsonUrl;
}

export function setSocketUrl(value: string): StorageResult<string> {
  const normalized = normalizeSocketUrl(value);

  if (!isWebSocketUrl(normalized)) {
    return {
      success: false,
      error: new Error('Invalid socket URL'),
    };
  }

  return setItem(STORAGE_KEYS.preferences.socketUrl, normalized);
}

export function setVersionJsonUrl(value: string): StorageResult<string> {
  const normalized = normalizeVersionJsonUrl(value);
  const parsed = urlSchema.safeParse(normalized);

  if (!parsed.success) {
    return {
      success: false,
      error: new Error('Invalid Android update URL'),
    };
  }

  return setItem(STORAGE_KEYS.preferences.versionJsonUrl, parsed.data);
}

export function resetSocketUrl(): StorageResult<void> {
  return removeItem(STORAGE_KEYS.preferences.socketUrl);
}

export function resetVersionJsonUrl(): StorageResult<void> {
  return removeItem(STORAGE_KEYS.preferences.versionJsonUrl);
}

export function resetApiBaseUrl(): StorageResult<void> {
  return removeItem(STORAGE_KEYS.preferences.apiBaseUrl);
}

export function isCustomApiBaseUrl(): boolean {
  const stored = getItem<string>(STORAGE_KEYS.preferences.apiBaseUrl);

  if (!stored.success || !stored.data) {
    return false;
  }

  const normalized = normalizeApiBaseUrl(stored.data);
  return apiBaseUrlSchema.safeParse(normalized).success && normalized !== defaultApiBaseUrl;
}

export function isCustomSocketUrl(): boolean {
  const stored = getItem<string>(STORAGE_KEYS.preferences.socketUrl);

  if (!stored.success || !stored.data) {
    return false;
  }

  const normalized = normalizeSocketUrl(stored.data);
  return isWebSocketUrl(normalized) && normalized !== defaultSocketUrl;
}

export function isCustomVersionJsonUrl(): boolean {
  const stored = getItem<string>(STORAGE_KEYS.preferences.versionJsonUrl);

  if (!stored.success || !stored.data) {
    return false;
  }

  const normalized = normalizeVersionJsonUrl(stored.data);
  return urlSchema.safeParse(normalized).success && normalized !== defaultVersionJsonUrl;
}
