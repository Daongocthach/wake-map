import { create } from 'zustand';
import type { WakeMapCoordinate, WakeMapPlace } from '../types';

export interface TrackingState {
  isTracking: boolean;
  selectedPlace: WakeMapPlace | null;
  radius: number;
  currentLocation: WakeMapCoordinate | null;
  isAlarming: boolean;

  // Actions
  startTracking: (place: WakeMapPlace, radius: number) => void;
  stopTracking: () => void;
  updateCurrentLocation: (location: WakeMapCoordinate | null) => void;
  triggerAlarm: () => void;
  dismissAlarm: () => void;
  setRadius: (radius: number) => void;
  setSelectedPlace: (place: WakeMapPlace | null) => void;
  setCurrentLocation: (location: WakeMapCoordinate | null) => void;
}

export const useTrackingStore = create<TrackingState>((set) => ({
  isTracking: false,
  selectedPlace: null,
  radius: 100,
  currentLocation: null,
  isAlarming: false,

  startTracking: (place, radius) =>
    set({
      isTracking: true,
      selectedPlace: place,
      radius,
      isAlarming: false,
    }),

  stopTracking: () =>
    set({
      isTracking: false,
      isAlarming: false,
    }),

  updateCurrentLocation: (location) =>
    set({
      currentLocation: location,
    }),

  triggerAlarm: () =>
    set({
      isAlarming: true,
    }),

  dismissAlarm: () =>
    set({
      isAlarming: false,
      isTracking: false,
    }),

  setRadius: (radius) =>
    set({
      radius,
    }),

  setSelectedPlace: (place) =>
    set({
      selectedPlace: place,
    }),

  setCurrentLocation: (location) =>
    set({
      currentLocation: location,
    }),
}));
