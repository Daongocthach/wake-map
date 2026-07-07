import { BellRing } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Button } from '@/common/components/Button';
import { ScreenContainer } from '@/common/components/ScreenContainer';
import { Text } from '@/common/components/Text';
import { SearchHeader, ConfigSheet, GoogleMap } from '@/features/wakemap/components';
import { useSavedPlaces, useRecentPlaces } from '@/features/wakemap/hooks';
import {
  startProximityTracking,
  stopProximityTracking,
  dismissProximityAlarm,
} from '@/features/wakemap/services';
import { useTrackingStore } from '@/features/wakemap/stores/trackingStore';
import type { WakeMapPlace } from '@/features/wakemap/types';
import { haversineMeters } from '@/features/wakemap/utils';
import { useLocationPermission } from '@/hooks';
import { useAppAlert } from '@/providers';

type RouteStatus = 'idle' | 'locating' | 'loading' | 'ready' | 'failed';

export default function WakeMapScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const appAlert = useAppAlert();
  const { requestBackgroundPermission } = useLocationPermission({ checkOnMount: false });

  // Zustand Selectors
  const isTracking = useTrackingStore((s) => s.isTracking);
  const selectedPlace = useTrackingStore((s) => s.selectedPlace);
  const radius = useTrackingStore((s) => s.radius);
  const currentLocation = useTrackingStore((s) => s.currentLocation);
  const isAlarming = useTrackingStore((s) => s.isAlarming);
  const notificationMode = useTrackingStore((s) => s.notificationMode);
  const setRadius = useTrackingStore((s) => s.setRadius);
  const setSelectedPlace = useTrackingStore((s) => s.setSelectedPlace);
  const setCurrentLocation = useTrackingStore((s) => s.setCurrentLocation);
  const cycleNotificationMode = useTrackingStore((s) => s.cycleNotificationMode);

  // Local UI States
  const [routeStatus, setRouteStatus] = useState<RouteStatus>('idle');
  const [routeErrorMessage, setRouteErrorMessage] = useState<string | null>(null);
  const [isConfigSheetVisible, setIsConfigSheetVisible] = useState(false);

  const { savedPlaces, isSaved, toggleSave } = useSavedPlaces();
  const { recentPlaces, addRecent, removeRecent } = useRecentPlaces();

  const handlePlaceSelect = useCallback(
    (place: WakeMapPlace) => {
      setSelectedPlace(place);
      // Defer addRecent to the next frame so SearchHeader can stabilize
      // after blur before recentPlaces (and its predefinedPlacesKey) changes.
      requestAnimationFrame(() => {
        addRecent(place);
      });
    },
    [addRecent, setSelectedPlace]
  );

  const handleToggleSave = useCallback(() => {
    if (selectedPlace) {
      toggleSave(selectedPlace);
    }
  }, [selectedPlace, toggleSave]);

  const handleToggleTracking = useCallback(async () => {
    if (isTracking) {
      await stopProximityTracking();
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

    // 1. Request background location permission ("Always")
    const bgPermission = await requestBackgroundPermission();
    if (!bgPermission.granted) {
      appAlert.alert(t('wakemap.startErrorTitle'), t('wakemap.permissionBackgroundDenied'));
      return;
    }

    // 2. Start background tracking
    const success = await startProximityTracking(selectedPlace, radius);
    if (!success) {
      appAlert.alert(t('wakemap.startErrorTitle'), t('wakemap.configSheet.routeErrorUnknown'));
    }
  }, [
    appAlert,
    currentLocation,
    isTracking,
    selectedPlace,
    radius,
    requestBackgroundPermission,
    t,
  ]);

  const handleRouteStatusChange = useCallback(
    (status: RouteStatus, errorMessage: string | null = null) => {
      setRouteStatus(status);
      setRouteErrorMessage(errorMessage);
    },
    []
  );

  const handleClearPlace = useCallback(async () => {
    await stopProximityTracking();
    setRadius(100);
    setRouteStatus('idle');
    setRouteErrorMessage(null);
    setSelectedPlace(null);
  }, [setRadius, setSelectedPlace]);

  const handleDismissAlarm = useCallback(async () => {
    await dismissProximityAlarm();
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
            savedPlaces={savedPlaces}
            selectedPlace={selectedPlace}
            isTracking={isTracking}
            radius={radius}
            currentLocation={currentLocation}
            onPlaceSelect={handlePlaceSelect}
            onCurrentLocationChange={setCurrentLocation}
            onRouteStatusChange={handleRouteStatusChange}
          />
        </View>

        <View style={styles.overlay} pointerEvents="box-none">
          <SearchHeader
            onPlaceSelect={handlePlaceSelect}
            savedPlaces={savedPlaces}
            recentPlaces={recentPlaces}
            onRemoveSaved={toggleSave}
            onRemoveRecent={removeRecent}
          />
          <ConfigSheet
            selectedPlace={selectedPlace}
            isSaved={selectedPlace ? isSaved(selectedPlace.id) : false}
            onToggleSave={handleToggleSave}
            isTracking={isTracking}
            notificationMode={notificationMode}
            radius={radius}
            onRadiusChange={setRadius}
            routeStatus={routeStatus}
            routeErrorMessage={routeErrorMessage}
            onToggleTracking={handleToggleTracking}
            onClearPlace={handleClearPlace}
            onToggleNotificationMode={cycleNotificationMode}
            onVisibilityChange={setIsConfigSheetVisible}
          />
        </View>

        {/* Fullscreen Alarm Overlay */}
        <Modal
          visible={isAlarming}
          transparent
          animationType="fade"
          onRequestClose={handleDismissAlarm}
        >
          <View style={styles.alarmOverlay}>
            <View style={styles.alarmCard}>
              <View style={styles.alarmIconContainer}>
                <BellRing size={48} color={theme.colors.state.error} />
              </View>
              <Text variant="h1" weight="bold" style={styles.alarmTitle}>
                {t('wakemap.arrived')}
              </Text>
              <Text variant="body" style={styles.alarmSubtitle}>
                {t('wakemap.arrivedSubtitle', { name: selectedPlace?.title ?? '' })}
              </Text>
              <Button
                title={t('wakemap.dismiss')}
                variant="primary"
                fullWidth
                style={styles.dismissButton}
                onPress={handleDismissAlarm}
              />
            </View>
          </View>
        </Modal>
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
  alarmOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay.modal,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.metrics.spacing.p24,
  },
  alarmCard: {
    width: '100%',
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.metrics.borderRadius.xl,
    padding: theme.metrics.spacing.p24,
    alignItems: 'center',
    gap: theme.metrics.spacingV.p16,
    shadowColor: theme.colors.overlay.shadow,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  alarmIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.state.errorBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.metrics.spacingV.p8,
  },
  alarmTitle: {
    color: theme.colors.state.error,
    textAlign: 'center',
  },
  alarmSubtitle: {
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.metrics.spacingV.p8,
  },
  dismissButton: {
    backgroundColor: theme.colors.state.error,
    borderRadius: theme.metrics.borderRadius.full,
  },
}));
