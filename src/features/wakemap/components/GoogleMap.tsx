import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { DEFAULT_REGION, SAVED_PLACES } from '../constants';
import type { WakeMapPlace } from '../types';

interface GoogleMapProps {
  selectedPlace?: WakeMapPlace | null;
}

export default function GoogleMap({ selectedPlace }: GoogleMapProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const mapRef = useRef<MapView | null>(null);
  const isSavedPlace = selectedPlace
    ? SAVED_PLACES.some((place) => place.title === selectedPlace.title)
    : false;

  useEffect(() => {
    if (!selectedPlace) {
      return;
    }

    mapRef.current?.animateToRegion(
      {
        latitude: selectedPlace.coordinate.latitude,
        longitude: selectedPlace.coordinate.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      350
    );
  }, [selectedPlace]);

  return (
    <View style={styles.container} accessibilityLabel={t('wakemap.title')}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={DEFAULT_REGION}
        showsCompass
        showsMyLocationButton={false}
        showsUserLocation={false}
      >
        {SAVED_PLACES.map((place) => (
          <Marker
            key={place.id}
            coordinate={place.coordinate}
            title={place.title}
            description={place.subtitle}
            pinColor={theme.colors.brand.primary}
          />
        ))}

        {selectedPlace && !isSavedPlace ? (
          <Marker
            coordinate={selectedPlace.coordinate}
            title={selectedPlace.title}
            description={selectedPlace.subtitle}
            pinColor={theme.colors.state.error}
          />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.app,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
}));
