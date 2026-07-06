import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { ScreenContainer } from '@/common/components/ScreenContainer';
import { SearchHeader, TrackingBar, ConfigSheet, GoogleMap } from '@/features/wakemap/components';

export default function WakeMapScreen() {
  return (
    <ScreenContainer padded={false} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.mapWrapper}>
          <GoogleMap />
        </View>

        <SearchHeader />

        <View style={styles.bottomContainer}>
          <TrackingBar />
          <ConfigSheet />
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
  bottomContainer: {
    position: 'absolute',
    bottom: theme.metrics.spacingV.p16,
    left: theme.metrics.spacing.p16,
    right: theme.metrics.spacing.p16,
    gap: theme.metrics.spacingV.p12,
    zIndex: 5,
  },
}));
