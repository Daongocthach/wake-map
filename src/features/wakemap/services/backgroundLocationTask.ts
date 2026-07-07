import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { BACKGROUND_LOCATION_TASK_NAME } from '../constants';
import { useTrackingStore } from '../stores/trackingStore';
import { haversineMeters } from '../utils/distance';
import { triggerProximityAlarm } from './alarmService';

interface TaskData {
  locations: Location.LocationObject[];
}

TaskManager.defineTask(BACKGROUND_LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    if (__DEV__) {
      console.error('Background location task error:', error);
    }
    return;
  }

  if (data) {
    const { locations } = data as TaskData;
    const [location] = locations;

    if (!location) {
      return;
    }

    const { latitude, longitude } = location.coords;
    const store = useTrackingStore.getState();
    const { selectedPlace, radius, isTracking, isAlarming } = store;

    // If we are not actively tracking or are already alarming, do nothing
    if (!isTracking || isAlarming || !selectedPlace) {
      return;
    }

    // 1. Update current location in the store
    store.updateCurrentLocation({ latitude, longitude });

    // 2. Calculate distance to target place
    const distanceMeters = haversineMeters(
      latitude,
      longitude,
      selectedPlace.coordinate.latitude,
      selectedPlace.coordinate.longitude
    );

    if (__DEV__) {
      console.warn(
        `[Background GPS] Current: (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) | ` +
          `Target: ${selectedPlace.title} | ` +
          `Distance: ${distanceMeters.toFixed(0)}m | ` +
          `Alarm Radius: ${radius}m`
      );
    }

    // 3. Trigger alarm if within radius
    if (distanceMeters <= radius) {
      if (__DEV__) {
        console.warn('Within radius! Triggering alarm...');
      }

      // Stop location updates first to conserve battery
      try {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK_NAME);
      } catch (err) {
        if (__DEV__) {
          console.error('Failed to stop location updates inside task:', err);
        }
      }

      // Trigger alarm sounds, vibrations, notifications
      await triggerProximityAlarm(selectedPlace.title, radius);
    }
  }
});
