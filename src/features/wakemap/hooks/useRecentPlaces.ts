import { useCallback, useMemo } from 'react';
import type { RecentPlace, WakeMapPlace } from '../types';
import { useStorage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/storage/constants';

export function useRecentPlaces() {
  const {
    value: recentPlacesRaw,
    setValue: setRecentPlacesRaw,
    loading,
    error,
  } = useStorage<RecentPlace[]>(STORAGE_KEYS.wakemap.recentPlaces, {
    defaultValue: [],
    initializeWithDefault: true,
  });

  const recentPlaces = useMemo(() => recentPlacesRaw || [], [recentPlacesRaw]);

  const addRecent = useCallback(
    (place: WakeMapPlace) => {
      const filtered = recentPlaces.filter((p) => p.id !== place.id);

      const newRecent: RecentPlace = {
        ...place,
        visitedAt: Date.now(),
      };

      const updated = [newRecent, ...filtered].slice(0, 3);

      setRecentPlacesRaw(updated);
    },
    [recentPlaces, setRecentPlacesRaw]
  );

  const removeRecent = useCallback(
    (placeId: string) => {
      const updated = recentPlaces.filter((p) => p.id !== placeId);
      setRecentPlacesRaw(updated);
    },
    [recentPlaces, setRecentPlacesRaw]
  );

  const clearRecent = useCallback(() => {
    setRecentPlacesRaw([]);
  }, [setRecentPlacesRaw]);

  return {
    recentPlaces,
    addRecent,
    removeRecent,
    clearRecent,
    loading,
    error,
  };
}
