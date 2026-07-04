import Constants from 'expo-constants';

interface EnvConfig {
  apiBaseUrl: string;
  socketUrl: string;
  versionJsonUrl: string;
  appEnv: 'development' | 'staging' | 'production';
  isDev: boolean;
  isProd: boolean;
}

function getEnvVar(key: string, fallback = ''): string {
  return process.env[key] ?? (Constants.expoConfig?.extra?.[key] as string | undefined) ?? fallback;
}

function getAppEnv(): EnvConfig['appEnv'] {
  const value = getEnvVar('EXPO_PUBLIC_APP_ENV', 'development');

  if (value === 'development' || value === 'staging' || value === 'production') {
    return value;
  }

  return 'development';
}

export const env: EnvConfig = {
  apiBaseUrl: getEnvVar('EXPO_PUBLIC_API_BASE_URL', 'https://xulynhietminhthanh.finepro.net'),
  socketUrl: getEnvVar('EXPO_PUBLIC_SOCKET_URL', 'https://xulynhietminhthanh.finepro.net/mqtt'),
  versionJsonUrl: getEnvVar(
    'EXPO_PUBLIC_VERSION_JSON_URL',
    'https://apifinetags.finepro.net/mobile-app/android/heattreatment/version.json'
  ),
  appEnv: getAppEnv(),
  get isDev() {
    return this.appEnv === 'development';
  },
  get isProd() {
    return this.appEnv === 'production';
  },
};

export function validateEnv(): string[] {
  const errors: string[] = [];

  const requiredEnvVars = [
    ['EXPO_PUBLIC_API_BASE_URL', env.apiBaseUrl],
    ['EXPO_PUBLIC_SOCKET_URL', env.socketUrl],
    ['EXPO_PUBLIC_VERSION_JSON_URL', env.versionJsonUrl],
  ] as const;

  requiredEnvVars.forEach(([key, value]) => {
    if (!value.trim()) {
      errors.push(`Missing environment variable: ${key}`);
    }
  });

  if (!['development', 'staging', 'production'].includes(env.appEnv)) {
    errors.push('EXPO_PUBLIC_APP_ENV must be development, staging, or production');
  }

  return errors;
}
