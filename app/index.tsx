import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { ScreenContainer } from '@/common/components/ScreenContainer';
import { SearchHeader, ConfigSheet, GoogleMap } from '@/features/wakemap/components';
import type { WakeMapPlace } from '@/features/wakemap/types';

type RouteStatus = 'idle' | 'locating' | 'loading' | 'ready' | 'failed';

export default function WakeMapScreen() {
  const [selectedPlace, setSelectedPlace] = useState<WakeMapPlace | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [routeStatus, setRouteStatus] = useState<RouteStatus>('idle');
  const [routeErrorMessage, setRouteErrorMessage] = useState<string | null>(null);

  const handleToggleTracking = useCallback(() => {
    setIsTracking((current) => !current);
  }, []);

  const handleRouteStatusChange = useCallback(
    (status: RouteStatus, errorMessage: string | null = null) => {
      setRouteStatus(status);
      setRouteErrorMessage(errorMessage);
    },
    []
  );

  const handleClearPlace = useCallback(() => {
    setIsTracking(false);
    setRouteStatus('idle');
    setRouteErrorMessage(null);
    setSelectedPlace(null);
  }, []);

  return (
    <ScreenContainer padded={false} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.mapWrapper}>
          <GoogleMap
            selectedPlace={selectedPlace}
            isTracking={isTracking}
            onPlaceSelect={setSelectedPlace}
            onRouteStatusChange={handleRouteStatusChange}
          />
        </View>

        <View style={styles.overlay} pointerEvents="box-none">
          <SearchHeader onPlaceSelect={setSelectedPlace} />
          <ConfigSheet
            selectedPlace={selectedPlace}
            isTracking={isTracking}
            routeStatus={routeStatus}
            routeErrorMessage={routeErrorMessage}
            onToggleTracking={handleToggleTracking}
            onClearPlace={handleClearPlace}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.app,
  },
  mapWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    elevation: 10,
  },
}));
