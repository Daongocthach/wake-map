import Slider from '@react-native-community/slider';
import type { TFunction } from 'i18next';
import { CircleStop, Heart, Navigation2, X } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { DEFAULT_REGION } from '../constants';
import type { WakeMapPlace } from '../types';
import { Button } from '@/common/components/Button';
import { IconButton } from '@/common/components/IconButton';
import { Text } from '@/common/components/Text';

interface ConfigSheetProps {
  selectedPlace: WakeMapPlace | null;
  isSaved: boolean;
  onToggleSave: () => void;
  isTracking: boolean;
  radius: number;
  onRadiusChange: (radius: number) => void;
  routeStatus: 'idle' | 'locating' | 'loading' | 'ready' | 'failed';
  routeErrorMessage: string | null;
  onToggleTracking: () => void;
  onClearPlace: () => void;
  onVisibilityChange?: (isVisible: boolean) => void;
}

export default function ConfigSheet({
  selectedPlace,
  isSaved,
  onToggleSave,
  isTracking,
  radius,
  onRadiusChange,
  routeStatus,
  routeErrorMessage,
  onToggleTracking,
  onClearPlace,
  onVisibilityChange,
}: ConfigSheetProps) {
  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    onVisibilityChange?.(Boolean(selectedPlace));
  }, [onVisibilityChange, selectedPlace]);

  if (!selectedPlace) {
    return null;
  }

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={[styles.panel, { paddingBottom: bottom }]} pointerEvents="auto">
        <ConfigSheetContent
          place={selectedPlace}
          isSaved={isSaved}
          onToggleSave={onToggleSave}
          isTracking={isTracking}
          radius={radius}
          onRadiusChange={onRadiusChange}
          routeStatus={routeStatus}
          routeErrorMessage={routeErrorMessage}
          onToggleTracking={onToggleTracking}
          onClose={() => {
            onClearPlace();
          }}
        />
      </View>
    </View>
  );
}

function ConfigSheetContent({
  place,
  isSaved,
  onToggleSave,
  isTracking,
  radius,
  onRadiusChange,
  routeStatus,
  routeErrorMessage,
  onToggleTracking,
  onClose,
}: {
  place: WakeMapPlace;
  isSaved: boolean;
  onToggleSave: () => void;
  isTracking: boolean;
  radius: number;
  onRadiusChange: (radius: number) => void;
  routeStatus: 'idle' | 'locating' | 'loading' | 'ready' | 'failed';
  routeErrorMessage: string | null;
  onToggleTracking: () => void;
  onClose: () => void;
}) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();
  const distanceKm = useMemo(() => {
    const meters = haversineMeters(
      DEFAULT_REGION.latitude,
      DEFAULT_REGION.longitude,
      place.coordinate.latitude,
      place.coordinate.longitude
    );

    return meters / 1000;
  }, [place.coordinate.latitude, place.coordinate.longitude]);

  return (
    <View style={[styles.sheet, { paddingBottom: bottom }]}>
      <View style={styles.handle} />

      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Text variant="h2" weight="bold" numberOfLines={1}>
            {place.title}
          </Text>
          {isTracking ? (
            <Text variant="body" style={styles.distanceText}>
              {t('wakemap.configSheet.distance', {
                distance: formatDistance(distanceKm),
              })}
            </Text>
          ) : null}
        </View>

        <View style={styles.headerActions}>
          {isTracking ? null : (
            <IconButton
              icon={X}
              size="sm"
              variant="ghost"
              accessibilityLabel={t('common.close')}
              onPress={() => {
                onClose();
              }}
            />
          )}
        </View>
      </View>

      <View style={styles.radiusCard}>
        <View style={styles.radiusRow}>
          <View style={styles.radiusLabelRow}>
            <Text variant="body" weight="medium">
              {t('wakemap.configSheet.radiusLabel')}
            </Text>
            <Text variant="body" weight="bold" style={styles.radiusValue}>
              {formatMeterLabel(radius, t('wakemap.configSheet.meterUnit'))}
            </Text>
          </View>
        </View>

        <Slider
          value={radius}
          minimumValue={100}
          maximumValue={2000}
          step={10}
          minimumTrackTintColor={theme.colors.brand.primary}
          maximumTrackTintColor={theme.colors.border.subtle}
          thumbTintColor={theme.colors.brand.primary}
          onValueChange={onRadiusChange}
        />

        <View style={styles.scaleRow}>
          <Text variant="caption" style={styles.scaleText}>
            {formatRadiusLabel(
              100,
              t('wakemap.configSheet.meterUnit'),
              t('wakemap.configSheet.kilometerUnit')
            )}
          </Text>
          <Text variant="caption" style={styles.scaleText}>
            {formatRadiusLabel(
              1000,
              t('wakemap.configSheet.meterUnit'),
              t('wakemap.configSheet.kilometerUnit')
            )}
          </Text>
          <Text variant="caption" style={styles.scaleText}>
            {formatRadiusLabel(
              2000,
              t('wakemap.configSheet.meterUnit'),
              t('wakemap.configSheet.kilometerUnit')
            )}
          </Text>
        </View>
      </View>

      {isTracking && routeStatus !== 'ready' ? (
        <View style={styles.routeStatusCard}>
          <Text variant="body" weight="medium" style={styles.routeStatusTitle}>
            {getRouteStatusLabel(routeStatus, t)}
          </Text>
          {routeErrorMessage ? (
            <Text variant="caption" style={styles.routeErrorText}>
              {t('wakemap.configSheet.routeError', { reason: routeErrorMessage })}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.actionRow}>
        <Button
          title={isTracking ? t('wakemap.configSheet.stop') : t('wakemap.configSheet.start')}
          leftIcon={isTracking ? <CircleStop /> : <Navigation2 />}
          variant={isTracking ? 'secondary' : 'primary'}
          size="md"
          fullWidth
          style={styles.startButton}
          onPress={() => {
            onToggleTracking();
          }}
        />
        <Button
          title={isSaved ? t('wakemap.configSheet.saved') : t('wakemap.configSheet.save')}
          leftIcon={
            <Heart
              fill={isSaved ? theme.colors.state.error : 'none'}
              color={isSaved ? theme.colors.state.error : undefined}
            />
          }
          variant={isSaved ? 'secondary' : 'outline'}
          size="md"
          fullWidth
          style={styles.saveButton}
          onPress={onToggleSave}
        />
      </View>
    </View>
  );
}

function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.max(100, Math.round((distanceKm * 1000) / 50) * 50)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}

function formatMeterLabel(value: number, unit: string): string {
  return `${value} ${unit}`;
}

function formatRadiusLabel(value: number, meterUnit: string, kilometerUnit: string): string {
  if (value >= 1000) {
    return `${value / 1000} ${kilometerUnit}`;
  }

  return `${value} ${meterUnit}`;
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

function getRouteStatusLabel(
  routeStatus: 'idle' | 'locating' | 'loading' | 'ready' | 'failed',
  t: TFunction
): string {
  switch (routeStatus) {
    case 'locating':
      return t('wakemap.configSheet.routeLocating');
    case 'loading':
      return t('wakemap.configSheet.routeLoading');
    case 'ready':
      return t('wakemap.configSheet.routeReady');
    case 'failed':
      return t('wakemap.configSheet.routeFailed');
    case 'idle':
    default:
      return t('wakemap.configSheet.routeIdle');
  }
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
    elevation: 30,
  },
  panel: {
    borderTopLeftRadius: theme.metrics.borderRadius.xl,
    borderTopRightRadius: theme.metrics.borderRadius.xl,
    backgroundColor: theme.colors.background.surface,
    shadowColor: theme.colors.overlay.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
    overflow: 'hidden',
  },
  sheet: {
    paddingHorizontal: theme.metrics.spacing.p16,
    paddingTop: theme.metrics.spacingV.p8,
    paddingBottom: theme.metrics.spacingV.p16,
    gap: theme.metrics.spacingV.p16,
  },
  handle: {
    alignSelf: 'center',
    width: theme.metrics.spacing.p40,
    height: 4,
    borderRadius: theme.metrics.borderRadius.full,
    backgroundColor: theme.colors.border.default,
    marginTop: theme.metrics.spacingV.p8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.metrics.spacing.p12,
  },
  headerTitle: {
    flex: 1,
    gap: theme.metrics.spacingV.p4,
  },
  distanceText: {
    color: theme.colors.state.success,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.metrics.spacing.p8,
  },
  radiusCard: {
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.metrics.borderRadius.xl,
    padding: theme.metrics.spacing.p16,
    gap: theme.metrics.spacingV.p12,
  },
  routeStatusCard: {
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.metrics.borderRadius.xl,
    paddingHorizontal: theme.metrics.spacing.p16,
    paddingVertical: theme.metrics.spacingV.p12,
    gap: theme.metrics.spacingV.p4,
  },
  routeStatusTitle: {
    color: theme.colors.text.primary,
  },
  routeErrorText: {
    color: theme.colors.state.error,
  },
  radiusRow: {
    gap: theme.metrics.spacingV.p8,
  },
  radiusLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.metrics.spacing.p12,
  },
  radiusValue: {
    color: theme.colors.brand.primary,
  },
  scaleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scaleText: {
    color: theme.colors.text.secondary,
  },
  modeRow: {
    flexDirection: 'row',
    gap: theme.metrics.spacing.p12,
  },
  modeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.metrics.spacingV.p12,
    paddingHorizontal: theme.metrics.spacing.p8,
    borderRadius: theme.metrics.borderRadius.xl,
    backgroundColor: theme.colors.background.elevated,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  modeCardSelected: {
    borderColor: theme.colors.brand.primary,
    shadowColor: theme.colors.overlay.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.metrics.spacing.p12,
    paddingTop: theme.metrics.spacingV.p4,
  },
  startButton: {
    flex: 1.15,
    borderRadius: theme.metrics.borderRadius.full,
  },
  saveButton: {
    flex: 1,
    borderRadius: theme.metrics.borderRadius.full,
  },
}));
