import * as Location from 'expo-location';
import { LocateFixed } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, View } from 'react-native';
import MapView, { Circle, Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { DEFAULT_REGION } from '../constants';
import type { WakeMapCoordinate, WakeMapPlace } from '../types';
import { IconButton } from '@/common/components/IconButton';
import { env } from '@/config/env';
import { useLocationPermission } from '@/hooks';

interface GoogleMapProps {
  savedPlaces: WakeMapPlace[];
  selectedPlace?: WakeMapPlace | null;
  isTracking: boolean;
  radius: number;
  currentLocation?: WakeMapCoordinate | null;
  onPlaceSelect: (place: WakeMapPlace) => void;
  onCurrentLocationChange: (location: WakeMapCoordinate | null) => void;
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
  savedPlaces,
  selectedPlace,
  isTracking,
  radius,
  currentLocation: propCurrentLocation,
  onPlaceSelect,
  onCurrentLocationChange,
  onRouteStatusChange,
}: GoogleMapProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { requestPermission } = useLocationPermission({ checkOnMount: false });
  const mapRef = useRef<MapView | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const isLocatingRef = useRef(false);
  const hasLoadedInitialLocationRef = useRef(false);
  const lastRouteFetchPlaceIdRef = useRef<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<WakeMapCoordinate | null>(
    propCurrentLocation ?? null
  );
  const [routeCoordinates, setRouteCoordinates] = useState<WakeMapCoordinate[]>([]);
  const isSavedPlace = selectedPlace
    ? savedPlaces.some((place) => place.title === selectedPlace.title)
    : false;

  const handlePlaceMarkerPress = (place: WakeMapPlace) => {
    if (selectedPlace?.id === place.id) {
      mapRef.current?.animateToRegion(
        {
          latitude: place.coordinate.latitude,
          longitude: place.coordinate.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        300
      );
      return;
    }

    onPlaceSelect(place);
  };

  useEffect(() => {
    if (!isTracking) {
      lastRouteFetchPlaceIdRef.current = null;
      setRouteCoordinates([]);
      onRouteStatusChange?.('idle');
    }
  }, [isTracking, onRouteStatusChange]);

  useEffect(() => {
    if (!selectedPlace) {
      lastRouteFetchPlaceIdRef.current = null;
      setRouteCoordinates([]);
      onRouteStatusChange?.('idle');
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
  }, [onRouteStatusChange, selectedPlace]);

  const updateCurrentLocation = useCallback(
    async (showStatus = false) => {
      if (isLocatingRef.current) {
        return;
      }

      isLocatingRef.current = true;
      setIsLocating(true);

      if (showStatus) {
        onRouteStatusChange?.('locating');
      }

      try {
        const nextCurrentLocation = await requestCurrentLocation(requestPermission);

        if (!nextCurrentLocation.location) {
          if (showStatus) {
            let errorMessage = t('wakemap.configSheet.routeErrorUnknown');

            if (nextCurrentLocation.error === 'permissionDenied') {
              errorMessage = t('wakemap.configSheet.routeErrorLocationDenied');
            } else if (nextCurrentLocation.error === 'servicesDisabled') {
              errorMessage = t('wakemap.configSheet.routeErrorLocationServicesDisabled');
            }

            onRouteStatusChange?.('failed', errorMessage);
          }

          return;
        }

        setCurrentLocation(nextCurrentLocation.location);
        onCurrentLocationChange(nextCurrentLocation.location);

        mapRef.current?.animateToRegion(
          {
            ...nextCurrentLocation.location,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          },
          350
        );
      } finally {
        isLocatingRef.current = false;
        setIsLocating(false);
      }
    },
    [onCurrentLocationChange, onRouteStatusChange, requestPermission, t]
  );

  useEffect(() => {
    if (propCurrentLocation) {
      setCurrentLocation(propCurrentLocation);
    }
  }, [propCurrentLocation]);

  useEffect(() => {
    if (hasLoadedInitialLocationRef.current || propCurrentLocation || currentLocation) {
      hasLoadedInitialLocationRef.current = true;
      return;
    }

    hasLoadedInitialLocationRef.current = true;
    void updateCurrentLocation();
  }, [currentLocation, propCurrentLocation, updateCurrentLocation]);

  useEffect(() => {
    onCurrentLocationChange(currentLocation);
  }, [currentLocation, onCurrentLocationChange]);

  useEffect(() => {
    let isActive = true;

    async function loadRouteOnce() {
      if (!selectedPlace) {
        return;
      }

      if (!currentLocation) {
        onRouteStatusChange?.('locating');
        return;
      }

      if (lastRouteFetchPlaceIdRef.current === selectedPlace.id) {
        return;
      }

      if (!env.googleMapApiKey) {
        setRouteCoordinates([]);
        onRouteStatusChange?.('failed', t('wakemap.configSheet.routeErrorMissingApiKey'));
        return;
      }

      lastRouteFetchPlaceIdRef.current = selectedPlace.id;

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

          if (!isActive) {
            return;
          }

          setRouteCoordinates([]);
          onRouteStatusChange?.(
            'failed',
            formatRouteHttpError(
              response.status,
              responseText,
              t('wakemap.configSheet.routeErrorHttp')
            )
          );

          return;
        }

        const data = (await response.json()) as ComputeRouteResponse;

        if (__DEV__) {
          console.warn('Routes API response', data);
        }

        const routes = data.routes ?? [];
        const preferredRoute =
          routes.find((route) => route.routeLabels?.includes('SHORTER_DISTANCE')) ?? routes[0];
        const encodedPolyline = preferredRoute?.polyline?.encodedPolyline;

        if (!encodedPolyline) {
          if (!isActive) {
            return;
          }

          setRouteCoordinates([]);
          onRouteStatusChange?.('failed', t('wakemap.configSheet.routeErrorEmptyPolyline'));

          return;
        }

        const decodedRoute = decodePolyline(encodedPolyline);

        if (!isActive) {
          return;
        }

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
      } catch (error) {
        if (__DEV__) {
          console.error('Failed to load route', error);
        }

        if (!isActive) {
          return;
        }

        setRouteCoordinates([]);
        onRouteStatusChange?.(
          'failed',
          error instanceof Error ? error.message : t('wakemap.configSheet.routeErrorUnknown')
        );
      }
    }

    void loadRouteOnce();
    return () => {
      isActive = false;
    };
  }, [currentLocation, onRouteStatusChange, selectedPlace, t]);

  const handleLocateCurrentPosition = async () => {
    await updateCurrentLocation(true);
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

        {selectedPlace ? (
          <Circle
            center={selectedPlace.coordinate}
            radius={radius}
            strokeColor={theme.colors.state.error}
            fillColor={theme.colors.state.errorBg}
          />
        ) : null}

        {savedPlaces.map((place) => (
          <Marker
            key={place.id}
            coordinate={place.coordinate}
            title={place.title}
            description={place.subtitle}
            pinColor={theme.colors.brand.primary}
            onPress={() => {
              handlePlaceMarkerPress(place);
            }}
          />
        ))}

        {selectedPlace && !isSavedPlace ? (
          <Marker
            coordinate={selectedPlace.coordinate}
            title={selectedPlace.title}
            description={selectedPlace.subtitle}
            pinColor={theme.colors.state.error}
            onPress={() => {
              handlePlaceMarkerPress(selectedPlace);
            }}
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

async function requestCurrentLocation(
  requestPermission: () => Promise<{
    status: Location.PermissionStatus | null;
    canAskAgain: boolean;
    granted: boolean;
  }>
): Promise<CurrentLocationResult> {
  const { status } = await requestPermission();

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

  try {
    const currentPosition = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
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
    top: '60%',
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
