import { useCallback, useMemo } from 'react';
import { SAVED_PLACES } from '../constants';
import type { WakeMapPlace } from '../types';
import { useStorage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/storage/constants';

export function useSavedPlaces() {
  const {
    value: savedPlacesRaw,
    setValue: setSavedPlacesRaw,
    loading,
    error,
  } = useStorage<WakeMapPlace[]>(STORAGE_KEYS.wakemap.savedPlaces, {
    defaultValue: SAVED_PLACES,
    initializeWithDefault: true,
  });

  const savedPlaces = useMemo(() => savedPlacesRaw || [], [savedPlacesRaw]);

  const isSaved = useCallback(
    (placeId: string) => {
      return savedPlaces.some((p) => p.id === placeId);
    },
    [savedPlaces]
  );

  const toggleSave = useCallback(
    (place: WakeMapPlace) => {
      const alreadySaved = isSaved(place.id);
      let updated: WakeMapPlace[];

      if (alreadySaved) {
        updated = savedPlaces.filter((p) => p.id !== place.id);
      } else {
        const newPlace: WakeMapPlace = {
          ...place,
          isSaved: true,
          savedAt: Date.now(),
        };
        updated = [...savedPlaces, newPlace];
      }

      setSavedPlacesRaw(updated);
    },
    [savedPlaces, isSaved, setSavedPlacesRaw]
  );

  return {
    savedPlaces,
    isSaved,
    toggleSave,
    loading,
    error,
  };
}
