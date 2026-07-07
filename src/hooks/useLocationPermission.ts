import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

interface LocationPermissionState {
  status: Location.PermissionStatus | null;
  canAskAgain: boolean;
  granted: boolean;
  isLoading: boolean;
}

const INITIAL_STATE: LocationPermissionState = {
  status: null,
  canAskAgain: false,
  granted: false,
  isLoading: true,
};

export function useLocationPermission() {
  const [permission, setPermission] = useState<LocationPermissionState>(INITIAL_STATE);

  useEffect(() => {
    let isActive = true;

    async function checkLocationPermission() {
      setPermission((currentPermission) => ({
        ...currentPermission,
        isLoading: true,
      }));

      try {
        const response = await Location.getForegroundPermissionsAsync();

        if (!isActive) {
          return;
        }

        setPermission({
          status: response.status,
          canAskAgain: response.canAskAgain,
          granted: response.granted,
          isLoading: false,
        });
      } catch (error) {
        if (__DEV__) {
          console.error('Failed to check location permission', error);
        }

        if (!isActive) {
          return;
        }

        setPermission({
          status: null,
          canAskAgain: false,
          granted: false,
          isLoading: false,
        });
      }
    }

    void checkLocationPermission();

    return () => {
      isActive = false;
    };
  }, []);

  return permission;
}
