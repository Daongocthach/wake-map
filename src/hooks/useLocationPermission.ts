import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

interface LocationPermissionState {
  status: Location.PermissionStatus | null;
  canAskAgain: boolean;
  granted: boolean;
  isLoading: boolean;
}

interface UseLocationPermissionOptions {
  checkOnMount?: boolean;
}

interface LocationPermissionResult {
  status: Location.PermissionStatus | null;
  canAskAgain: boolean;
  granted: boolean;
}

type PermissionStateUpdater =
  | LocationPermissionState
  | ((currentPermission: LocationPermissionState) => LocationPermissionState);

const INITIAL_STATE: LocationPermissionState = {
  status: null,
  canAskAgain: false,
  granted: false,
  isLoading: true,
};

function toPermissionResult(
  response: Location.LocationPermissionResponse
): LocationPermissionResult {
  return {
    status: response.status,
    canAskAgain: response.canAskAgain,
    granted: response.granted,
  };
}

export function useLocationPermission(options: UseLocationPermissionOptions = {}) {
  const [permission, setPermission] = useState<LocationPermissionState>(INITIAL_STATE);
  const isMountedRef = useRef(true);

  const setPermissionState = useCallback((nextPermission: PermissionStateUpdater) => {
    if (isMountedRef.current) {
      setPermission(nextPermission);
    }
  }, []);

  const syncPermission = useCallback(
    async (fetchPermission: () => Promise<Location.LocationPermissionResponse>) => {
      setPermissionState((currentPermission) => ({
        ...currentPermission,
        isLoading: true,
      }));

      try {
        const response = await fetchPermission();
        const nextPermission = toPermissionResult(response);

        setPermissionState({
          ...nextPermission,
          isLoading: false,
        });

        return nextPermission;
      } catch (error) {
        if (__DEV__) {
          console.error('Failed to sync location permission', error);
        }

        const fallbackPermission = {
          status: null,
          canAskAgain: false,
          granted: false,
        };

        setPermissionState({
          ...fallbackPermission,
          isLoading: false,
        });

        return fallbackPermission;
      }
    },
    [setPermissionState]
  );

  const checkPermission = useCallback(() => {
    return syncPermission(() => Location.getForegroundPermissionsAsync());
  }, [syncPermission]);

  const requestPermission = useCallback(() => {
    return syncPermission(() => Location.requestForegroundPermissionsAsync());
  }, [syncPermission]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (options.checkOnMount === false) {
      setPermissionState((currentPermission) => ({
        ...currentPermission,
        isLoading: false,
      }));
      return;
    }

    void checkPermission();
  }, [checkPermission, options.checkOnMount, setPermissionState]);

  return {
    ...permission,
    checkPermission,
    requestPermission,
  };
}
