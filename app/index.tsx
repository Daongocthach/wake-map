import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { ScreenContainer } from '@/common/components/ScreenContainer';
import { SearchHeader, ConfigSheet, GoogleMap } from '@/features/wakemap/components';
import type { WakeMapCoordinate, WakeMapPlace } from '@/features/wakemap/types';
import { useAppAlert } from '@/providers';

type RouteStatus = 'idle' | 'locating' | 'loading' | 'ready' | 'failed';

export default function WakeMapScreen() {
  const { t } = useTranslation();
  const appAlert = useAppAlert();
  const [selectedPlace, setSelectedPlace] = useState<WakeMapPlace | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [radius, setRadius] = useState(100);
  const [currentLocation, setCurrentLocation] = useState<WakeMapCoordinate | null>(null);
  const [routeStatus, setRouteStatus] = useState<RouteStatus>('idle');
  const [routeErrorMessage, setRouteErrorMessage] = useState<string | null>(null);
  const [isConfigSheetVisible, setIsConfigSheetVisible] = useState(false);

  const handleToggleTracking = useCallback(() => {
    if (isTracking) {
      setIsTracking(false);
      return;
    }

    if (!selectedPlace) {
      appAlert.alert(t('wakemap.startErrorTitle'), t('wakemap.startErrorNoPlace'));
      return;
    }

    if (!currentLocation) {
      appAlert.alert(t('wakemap.startErrorTitle'), t('wakemap.startErrorNoCurrentLocation'));
      return;
    }

    const distanceMeters = haversineMeters(
      currentLocation.latitude,
      currentLocation.longitude,
      selectedPlace.coordinate.latitude,
      selectedPlace.coordinate.longitude
    );

    if (distanceMeters < 100) {
      appAlert.alert(t('wakemap.startErrorTitle'), t('wakemap.startErrorTooClose'));
      return;
    }

    setIsTracking(true);
  }, [appAlert, currentLocation, isTracking, selectedPlace, t]);

  const handleRouteStatusChange = useCallback(
    (status: RouteStatus, errorMessage: string | null = null) => {
      setRouteStatus(status);
      setRouteErrorMessage(errorMessage);
    },
    []
  );

  const handleClearPlace = useCallback(() => {
    setIsTracking(false);
    setRadius(100);
    setRouteStatus('idle');
    setRouteErrorMessage(null);
    setSelectedPlace(null);
  }, []);

  return (
    <ScreenContainer padded={false} edges={['top']}>
      <View style={styles.container}>
        <View
          style={[
            styles.mapWrapper,
            isConfigSheetVisible ? styles.mapWrapperCollapsed : styles.mapWrapperExpanded,
          ]}
        >
          <GoogleMap
            selectedPlace={selectedPlace}
            isTracking={isTracking}
            radius={radius}
            onPlaceSelect={setSelectedPlace}
            onCurrentLocationChange={setCurrentLocation}
            onRouteStatusChange={handleRouteStatusChange}
          />
        </View>

        <View style={styles.overlay} pointerEvents="box-none">
          <SearchHeader onPlaceSelect={setSelectedPlace} />
          <ConfigSheet
            selectedPlace={selectedPlace}
            isTracking={isTracking}
            radius={radius}
            onRadiusChange={setRadius}
            routeStatus={routeStatus}
            routeErrorMessage={routeErrorMessage}
            onToggleTracking={handleToggleTracking}
            onClearPlace={handleClearPlace}
            onVisibilityChange={setIsConfigSheetVisible}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const earthRadius = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.app,
  },
  mapWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  mapWrapperExpanded: {
    bottom: 0,
  },
  mapWrapperCollapsed: {
    bottom: theme.metrics.spacingV.p120,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    elevation: 10,
  },
}));
