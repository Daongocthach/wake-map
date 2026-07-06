import * as Location from 'expo-location';
import { LocateFixed } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { DEFAULT_REGION, SAVED_PLACES } from '../constants';
import type { WakeMapCoordinate, WakeMapPlace } from '../types';
import { IconButton } from '@/common/components/IconButton';

interface GoogleMapProps {
  selectedPlace?: WakeMapPlace | null;
}

export default function GoogleMap({ selectedPlace }: GoogleMapProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const mapRef = useRef<MapView | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<WakeMapCoordinate | null>(null);
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

  const handleLocateCurrentPosition = async () => {
    if (isLocating) {
      return;
    }

    setIsLocating(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        return;
      }

      const currentPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const nextCurrentLocation = {
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
      };

      setCurrentLocation(nextCurrentLocation);

      mapRef.current?.animateToRegion(
        {
          ...nextCurrentLocation,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        350
      );
    } finally {
      setIsLocating(false);
    }
  };

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

        {currentLocation ? (
          <Marker
            coordinate={currentLocation}
            title={t('wakemap.currentLocation')}
            description={t('wakemap.currentLocation')}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View
              style={styles.currentLocationMarker}
              accessibilityLabel={t('wakemap.currentLocation')}
            >
              <View style={styles.currentLocationRing} />
              <View style={styles.currentLocationDot} />
            </View>
          </Marker>
        ) : null}
      </MapView>

      <View style={styles.currentLocationButton} pointerEvents="box-none">
        <IconButton
          icon={LocateFixed}
          size="md"
          variant="secondary"
          loading={isLocating}
          accessibilityLabel={t('wakemap.currentLocation')}
          onPress={handleLocateCurrentPosition}
        />
      </View>
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
  currentLocationButton: {
    position: 'absolute',
    top: theme.metrics.spacingV.p96,
    right: theme.metrics.spacing.p16,
    zIndex: 15,
    elevation: 15,
  },
  currentLocationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationRing: {
    position: 'absolute',
    width: theme.metrics.spacing.p24,
    height: theme.metrics.spacing.p24,
    borderRadius: theme.metrics.borderRadius.full,
    backgroundColor: theme.colors.brand.primaryVariant,
    opacity: 0.18,
  },
  currentLocationDot: {
    width: theme.metrics.spacing.p12,
    height: theme.metrics.spacing.p12,
    borderRadius: theme.metrics.borderRadius.full,
    backgroundColor: theme.colors.brand.primary,
    borderWidth: 2,
    borderColor: theme.colors.text.onBrand,
  },
}));
