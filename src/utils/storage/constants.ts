export const STORAGE_KEYS = {
  preferences: {
    theme: 'user_theme_preference',
    themePreset: 'user_theme_preset',
    language: 'user_language',
    apiBaseUrl: 'user_api_base_url',
    socketUrl: 'user_socket_url',
    versionJsonUrl: 'user_update_android_url',
    onboardingCompleted: 'onboarding_completed',
  },
  auth: {
    lastEmail: 'auth_last_email',
    session: 'auth_session',
    user: 'auth_user',
  },
  app: {
    lastVersion: 'app_last_version',
    launchCount: 'app_launch_count',
  },
  wakemap: {
    savedPlaces: 'wakemap_saved_places',
    lastCoordinates: 'wakemap_last_coordinates',
    activeTracking: 'wakemap_active_tracking',
  },
} as const;
