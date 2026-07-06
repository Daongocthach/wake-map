import * as Location from 'expo-location';
import { LocateFixed } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { DEFAULT_REGION, SAVED_PLACES } from '../constants';
import type { WakeMapCoordinate, WakeMapPlace } from '../types';
import { IconButton } from '@/common/components/IconButton';
import { env } from '@/config/env';

interface GoogleMapProps {
  selectedPlace?: WakeMapPlace | null;
  isTracking: boolean;
  onRouteStatusChange?: (status: RouteStatus, errorMessage?: string | null) => void;
}

type RouteStatus = 'idle' | 'locating' | 'loading' | 'ready' | 'failed';

interface ComputeRouteResponse {
  routes?: Array<{
    polyline?: {
      encodedPolyline?: string;
    };
    routeLabels?: string[];
  }>;
}

export default function GoogleMap({
  selectedPlace,
  isTracking,
  onRouteStatusChange,
}: GoogleMapProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const mapRef = useRef<MapView | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<WakeMapCoordinate | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<WakeMapCoordinate[]>([]);
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

  useEffect(() => {
    if (!isTracking) {
      setRouteCoordinates([]);
      onRouteStatusChange?.('idle');
      return;
    }

    let isActive = true;

    const run = async () => {
      setIsLocating(true);
      onRouteStatusChange?.('locating');

      try {
        const result = await requestCurrentLocation();

        if (!isActive) {
          return;
        }

        if (!result.location) {
          let errorMessage = t('wakemap.configSheet.routeErrorUnknown');

          if (result.error === 'permissionDenied') {
            errorMessage = t('wakemap.configSheet.routeErrorLocationDenied');
          } else if (result.error === 'servicesDisabled') {
            errorMessage = t('wakemap.configSheet.routeErrorLocationServicesDisabled');
          }

          onRouteStatusChange?.('failed', errorMessage);
          return;
        }

        setCurrentLocation(result.location);

        mapRef.current?.animateToRegion(
          {
            ...result.location,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          },
          350
        );
      } finally {
        if (isActive) {
          setIsLocating(false);
        }
      }
    };

    void run();

    return () => {
      isActive = false;
    };
  }, [isTracking, onRouteStatusChange, t]);

  useEffect(() => {
    let isActive = true;

    async function loadRoute() {
      if (!isTracking) {
        return;
      }

      if (!selectedPlace) {
        setRouteCoordinates([]);
        onRouteStatusChange?.('failed', t('wakemap.configSheet.routeErrorNoPlace'));
        return;
      }

      if (!currentLocation) {
        onRouteStatusChange?.('locating');
        return;
      }

      if (!env.googleMapApiKey) {
        setRouteCoordinates([]);
        onRouteStatusChange?.('failed', t('wakemap.configSheet.routeErrorMissingApiKey'));
        return;
      }

      try {
        onRouteStatusChange?.('loading');
        const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': env.googleMapApiKey,
            'X-Goog-FieldMask':
              'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline,routes.routeLabels',
          },
          body: JSON.stringify({
            origin: {
              location: {
                latLng: {
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                },
              },
            },
            destination: {
              location: {
                latLng: {
                  latitude: selectedPlace.coordinate.latitude,
                  longitude: selectedPlace.coordinate.longitude,
                },
              },
            },
            travelMode: 'DRIVE',
            routingPreference: 'TRAFFIC_AWARE',
            requestedReferenceRoutes: ['SHORTER_DISTANCE'],
            polylineEncoding: 'ENCODED_POLYLINE',
          }),
        });

        if (!response.ok) {
          const responseText = await response.text();

          if (__DEV__) {
            console.error('Routes API error', response.status, responseText);
          }

          if (isActive) {
            setRouteCoordinates([]);
            onRouteStatusChange?.(
              'failed',
              formatRouteHttpError(
                response.status,
                responseText,
                t('wakemap.configSheet.routeErrorHttp')
              )
            );
          }

          return;
        }

        const data = (await response.json()) as ComputeRouteResponse;
        const routes = data.routes ?? [];
        const preferredRoute =
          routes.find((route) => route.routeLabels?.includes('SHORTER_DISTANCE')) ?? routes[0];
        const encodedPolyline = preferredRoute?.polyline?.encodedPolyline;

        if (!encodedPolyline) {
          if (isActive) {
            setRouteCoordinates([]);
            onRouteStatusChange?.('failed', t('wakemap.configSheet.routeErrorEmptyPolyline'));
          }
          return;
        }

        const decodedRoute = decodePolyline(encodedPolyline);

        if (isActive) {
          setRouteCoordinates(decodedRoute);
          onRouteStatusChange?.('ready');

          if (decodedRoute.length > 1) {
            mapRef.current?.fitToCoordinates(decodedRoute, {
              edgePadding: {
                top: 120,
                right: 80,
                bottom: 260,
                left: 80,
              },
              animated: true,
            });
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Failed to load route', error);
        }

        if (isActive) {
          setRouteCoordinates([]);
          onRouteStatusChange?.(
            'failed',
            error instanceof Error ? error.message : t('wakemap.configSheet.routeErrorUnknown')
          );
        }
      }
    }

    void loadRoute();

    return () => {
      isActive = false;
    };
  }, [currentLocation, isTracking, onRouteStatusChange, selectedPlace, t]);

  const handleLocateCurrentPosition = async () => {
    if (isLocating) {
      return;
    }

    setIsLocating(true);
    onRouteStatusChange?.('locating');

    try {
      const nextCurrentLocation = await requestCurrentLocation();

      if (!nextCurrentLocation.location) {
        let errorMessage = t('wakemap.configSheet.routeErrorUnknown');

        if (nextCurrentLocation.error === 'permissionDenied') {
          errorMessage = t('wakemap.configSheet.routeErrorLocationDenied');
        } else if (nextCurrentLocation.error === 'servicesDisabled') {
          errorMessage = t('wakemap.configSheet.routeErrorLocationServicesDisabled');
        }

        onRouteStatusChange?.('failed', errorMessage);
        return;
      }

      setCurrentLocation(nextCurrentLocation.location);

      mapRef.current?.animateToRegion(
        {
          ...nextCurrentLocation.location,
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
        {routeCoordinates.length > 1 ? (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={theme.colors.brand.primary}
            strokeWidth={4}
          />
        ) : null}

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

type CurrentLocationResult =
  | {
      location: WakeMapCoordinate;
      error: null;
    }
  | {
      location: null;
      error: 'permissionDenied' | 'servicesDisabled' | 'unavailable';
    };

async function requestCurrentLocation(): Promise<CurrentLocationResult> {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    return {
      location: null,
      error: 'permissionDenied',
    };
  }

  const servicesEnabled = await Location.hasServicesEnabledAsync();

  if (!servicesEnabled) {
    return {
      location: null,
      error: 'servicesDisabled',
    };
  }

  const lastKnownPosition = await Location.getLastKnownPositionAsync();

  if (lastKnownPosition) {
    return {
      location: {
        latitude: lastKnownPosition.coords.latitude,
        longitude: lastKnownPosition.coords.longitude,
      },
      error: null,
    };
  }

  try {
    const currentPosition = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      location: {
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
      },
      error: null,
    };
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to get current location', error);
    }

    return {
      location: null,
      error: 'unavailable',
    };
  }
}

function decodePolyline(encodedPolyline: string): WakeMapCoordinate[] {
  const coordinates: WakeMapCoordinate[] = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;

  while (index < encodedPolyline.length) {
    let result = 0;
    let shift = 0;
    let byte = 0;

    do {
      byte = encodedPolyline.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLatitude = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    latitude += deltaLatitude;

    result = 0;
    shift = 0;

    do {
      byte = encodedPolyline.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLongitude = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    longitude += deltaLongitude;

    coordinates.push({
      latitude: latitude / 1e5,
      longitude: longitude / 1e5,
    });
  }

  return coordinates;
}

function formatRouteHttpError(status: number, responseText: string, fallback: string): string {
  const trimmedText = responseText.trim();

  if (!trimmedText) {
    return `${fallback}: HTTP ${status}`;
  }

  return `${fallback}: HTTP ${status} - ${trimmedText.slice(0, 160)}`;
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
