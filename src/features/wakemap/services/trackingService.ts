import * as Location from 'expo-location';
import { BACKGROUND_LOCATION_TASK_NAME } from '../constants';
import { useTrackingStore } from '../stores/trackingStore';
import type { WakeMapPlace } from '../types';

/**
 * Starts continuous background location updates for proximity alerting
 */
export async function startProximityTracking(
  place: WakeMapPlace,
  radius: number
): Promise<boolean> {
  try {
    // 1. Check foreground and background location permissions
    const foregroundStatus = await Location.getForegroundPermissionsAsync();
    if (!foregroundStatus.granted) {
      if (__DEV__) console.warn('Foreground location permission not granted.');
      return false;
    }

    const backgroundStatus = await Location.getBackgroundPermissionsAsync();
    if (!backgroundStatus.granted) {
      if (__DEV__) console.warn('Background location permission not granted.');
      return false;
    }

    // 2. Check if location services are enabled
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      if (__DEV__) console.warn('Location services are disabled.');
      return false;
    }

    // 3. Update Zustand Store State
    const store = useTrackingStore.getState();
    store.startTracking(place, radius);

    // 4. Start Location Updates Task in Background
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 30000, // Update location every 30 seconds
      distanceInterval: 50, // Or every 50 meters
      showsBackgroundLocationIndicator: true, // Show blue bar on iOS
      pausesUpdatesAutomatically: false, // Don't stop when idle
      activityType: Location.ActivityType.AutomotiveNavigation, // Optimize for transit
      foregroundService: {
        notificationTitle: 'WakeMap Đang Canh Đường',
        notificationBody: `Đang theo dõi vị trí của bạn tới ${place.title}`,
        killServiceOnDestroy: false,
      },
    });

    if (__DEV__) {
      console.warn('Successfully started background location updates for', place.title);
    }
    return true;
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to start proximity tracking:', error);
    }
    return false;
  }
}

/**
 * Stops background location updates
 */
export async function stopProximityTracking(): Promise<void> {
  try {
    const isRunning = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME);
    if (isRunning) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME);
    }

    // Reset store state
    const store = useTrackingStore.getState();
    store.stopTracking();

    if (__DEV__) {
      console.warn('Successfully stopped background location updates.');
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to stop proximity tracking:', error);
    }
  }
}
