import type { ExpoConfig } from '@expo/config-types';
import 'tsx/cjs';

function getEnvVar(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

const config: ExpoConfig = {
  name: 'Wake Map',
  slug: 'wake-map',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'wake-map',
  userInterfaceStyle: 'automatic',
  runtimeVersion: {
    policy: 'appVersion',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.ngocthach.wakemap',
    icon: {
      light: './assets/ios-icon.png',
    },
    infoPlist: {
      CFBundleAllowMixedLocalizations: true,
      CFBundleLocalizations: ['en', 'vi', 'zh-CN', 'zh-TW'],
      ITSAppUsesNonExemptEncryption: false,
      NSLocationWhenInUseUsageDescription:
        'WakeMap requires access to your location to track your distance and guide you to your destination.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'WakeMap requires background location access to monitor your route and wake you up when arriving, even when the app is closed or in the background.',
      NSLocationAlwaysUsageDescription:
        'WakeMap requires background location access to monitor your route and wake you up when arriving, even when the app is closed or in the background.',
      UIBackgroundModes: ['location'],
    },
    buildNumber: '1',
  },
  android: {
    versionCode: 1,
    softwareKeyboardLayoutMode: 'resize',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF',
    },
    package: 'com.ngocthach.wakemap',
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'ACCESS_BACKGROUND_LOCATION',
      'FOREGROUND_SERVICE',
      'FOREGROUND_SERVICE_LOCATION',
      'FOREGROUND_SERVICE_MEDIA_PLAYBACK',
      'WAKE_LOCK',
    ],
  },
  extra: {
    router: {},
    eas: {
      projectId: '',
    },
    EXPO_PUBLIC_API_BASE_URL: getEnvVar('EXPO_PUBLIC_API_BASE_URL'),
    EXPO_PUBLIC_SOCKET_URL: getEnvVar('EXPO_PUBLIC_SOCKET_URL'),
    EXPO_PUBLIC_VERSION_JSON_URL: getEnvVar('EXPO_PUBLIC_VERSION_JSON_URL'),
    EXPO_PUBLIC_GOOGLE_MAP_API_KEY: getEnvVar('EXPO_PUBLIC_GOOGLE_MAP_API_KEY'),
    EXPO_PUBLIC_APP_ENV: getEnvVar('EXPO_PUBLIC_APP_ENV', 'development'),
  },
  plugins: [
    [
      'expo-localization',
      {
        supportedLocales: {
          ios: ['en', 'vi', 'zh-CN', 'zh-TW'],
          android: ['en', 'vi', 'zh-CN', 'zh-TW'],
        },
      },
    ],
    [
      'react-native-maps',
      {
        androidGoogleMapsApiKey: getEnvVar('EXPO_PUBLIC_GOOGLE_MAP_API_KEY'),
        iosGoogleMapsApiKey: getEnvVar('EXPO_PUBLIC_GOOGLE_MAP_API_KEY'),
      },
    ],
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon-light.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#FFFFFF',
        dark: {
          image: './assets/splash-icon-dark.png',
          backgroundColor: '#020617',
        },
      },
    ],
    'expo-font',
    'expo-image',
    'expo-system-ui',
    [
      'expo-location',
      {
        isIosBackgroundLocationEnabled: true,
        isAndroidBackgroundLocationEnabled: true,
        isAndroidForegroundServiceEnabled: true,
      },
    ],
    [
      'expo-audio',
      {
        enableBackgroundPlayback: true,
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 36,
          targetSdkVersion: 36,
          minSdkVersion: 24,
          usesCleartextTraffic: true,
        },
        ios: {
          deploymentTarget: '15.1',
        },
      },
    ],
    ['./plugins/with-android-splits'],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: false,
  },
};

export default config;
