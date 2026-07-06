import { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { ScreenContainer } from '@/common/components/ScreenContainer';
import { SearchHeader, TrackingBar, ConfigSheet, GoogleMap } from '@/features/wakemap/components';
import type { WakeMapPlace } from '@/features/wakemap/types';

export default function WakeMapScreen() {
  const [selectedPlace, setSelectedPlace] = useState<WakeMapPlace | null>(null);

  return (
    <ScreenContainer padded={false} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.mapWrapper}>
          <GoogleMap selectedPlace={selectedPlace} />
        </View>

        <View style={styles.overlay} pointerEvents="box-none">
          <SearchHeader onPlaceSelect={setSelectedPlace} />

          <View style={styles.bottomContainer}>
            <TrackingBar />
            <ConfigSheet />
          </View>
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
  bottomContainer: {
    position: 'absolute',
    bottom: theme.metrics.spacingV.p16,
    left: theme.metrics.spacing.p16,
    right: theme.metrics.spacing.p16,
    gap: theme.metrics.spacingV.p12,
    zIndex: 20,
    elevation: 20,
  },
}));
