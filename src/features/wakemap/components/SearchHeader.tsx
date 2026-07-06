import { ArrowUpRight, History, MapPin, Search } from 'lucide-react-native';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  GooglePlacesAutocomplete,
  type GooglePlaceData,
  type GooglePlaceDetail,
  type GooglePlacesAutocompleteRef,
} from 'react-native-google-places-autocomplete';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { SAVED_PLACES } from '../constants';
import type { WakeMapPlace } from '../types';
import { Icon } from '@/common/components/Icon';
import { IconButton } from '@/common/components/IconButton';
import { Text } from '@/common/components/Text';
import { env } from '@/config/env';
import { vs } from '@/theme/metrics';

interface SearchHeaderProps {
  onPlaceSelect?: (place: WakeMapPlace) => void;
}

interface GeometryLocation {
  lat: number;
  lng: number;
  latitude: number;
  longitude: number;
}

interface GooglePlaceDataWithGeometry extends GooglePlaceData {
  geometry: {
    location: GeometryLocation;
  };
}

function hasGeometry(data: GooglePlaceData): data is GooglePlaceDataWithGeometry {
  if (!('geometry' in data)) {
    return false;
  }

  const geometry = data.geometry;

  if (!geometry || typeof geometry !== 'object' || !('location' in geometry)) {
    return false;
  }

  const location = (geometry as { location?: unknown }).location;

  if (!location || typeof location !== 'object') {
    return false;
  }

  const candidate = location as Record<string, unknown>;

  return (
    typeof candidate.lat === 'number' &&
    typeof candidate.lng === 'number' &&
    typeof candidate.latitude === 'number' &&
    typeof candidate.longitude === 'number'
  );
}

function normalizeCoordinate(location: {
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
}): { latitude: number; longitude: number } | null {
  const latitude = typeof location.latitude === 'number' ? location.latitude : location.lat;
  const longitude = typeof location.longitude === 'number' ? location.longitude : location.lng;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null;
  }

  return { latitude, longitude };
}

function createWakeMapPlace(
  data: GooglePlaceData,
  detail: GooglePlaceDetail | null
): WakeMapPlace | null {
  const title = data.description || data.structured_formatting?.main_text || '';
  const savedPlace = SAVED_PLACES.find((place) => place.title === title);
  const subtitle = data.structured_formatting?.secondary_text || savedPlace?.subtitle || '';
  const detailLocation = detail?.geometry.location;
  const dataLocation = hasGeometry(data) ? data.geometry.location : null;
  const location = detailLocation ?? dataLocation ?? savedPlace?.coordinate ?? null;

  if (!title || !location) {
    return null;
  }

  const coordinate = normalizeCoordinate(location);

  if (!coordinate) {
    return null;
  }

  return {
    id: 'place_id' in data && data.place_id ? data.place_id : title,
    title,
    subtitle,
    coordinate,
  };
}

export default function SearchHeader({ onPlaceSelect }: SearchHeaderProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const ref = useRef<GooglePlacesAutocompleteRef | null>(null);

  const handleBack = () => {
    ref.current?.blur();
  };

  const renderCustomRow = (rowData: GooglePlaceData) => {
    const title = rowData.description || rowData.structured_formatting?.main_text || '';
    const subtitle = rowData.structured_formatting?.secondary_text || t('wakemap.searchResultHint');
    const isSavedPlace = SAVED_PLACES.some((place) => place.title === title);
    const rightIcon = isSavedPlace ? History : ArrowUpRight;

    return (
      <View style={styles.rowContainer}>
        <View style={styles.iconCircle}>
          <Icon icon={MapPin} size={16} color={theme.colors.brand.primary} />
        </View>

        <View style={styles.textContainer}>
          <Text variant="bodySmall" weight="bold" style={styles.rowTitle}>
            {title}
          </Text>
          <Text variant="caption" style={styles.rowSubtitle}>
            {subtitle}
          </Text>
        </View>

        <Icon icon={rightIcon} size={18} variant="muted" style={styles.rightArrow} />
      </View>
    );
  };
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <GooglePlacesAutocomplete
        ref={ref}
        placeholder={t('wakemap.searchPlaceholder')}
        minLength={2}
        debounce={250}
        fetchDetails
        predefinedPlaces={SAVED_PLACES.map((place) => ({
          description: place.title,
          geometry: {
            location: {
              lat: place.coordinate.latitude,
              lng: place.coordinate.longitude,
              latitude: place.coordinate.latitude,
              longitude: place.coordinate.longitude,
            },
          },
        }))}
        keepResultsAfterBlur
        listViewDisplayed
        query={{
          key: env.googleMapApiKey,
          language: 'vi',
          components: 'country:vn',
        }}
        onPress={(data, detail) => {
          const place = createWakeMapPlace(data, detail);

          if (place) {
            onPlaceSelect?.(place);
          }

          ref.current?.blur();
        }}
        textInputProps={{
          placeholderTextColor: theme.colors.text.muted,
          autoCorrect: false,
          autoCapitalize: 'none',
          returnKeyType: 'search',
          clearButtonMode: 'while-editing',
        }}
        renderLeftButton={() => (
          <IconButton
            icon={Search}
            size="sm"
            accessibilityLabel={t('common.search')}
            onPress={handleBack}
            style={styles.backButton}
          />
        )}
        renderRow={renderCustomRow}
        styles={{
          container: styles.autocompleteContainer,
          textInputContainer: styles.textInputContainer,
          textInput: styles.textInput,
          listView: styles.listView,
          row: styles.row,
          separator: styles.separator,
          description: styles.description,
          poweredContainer: styles.poweredContainer,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    position: 'absolute',
    top: theme.metrics.spacingV.p12,
    left: theme.metrics.spacing.p16,
    right: theme.metrics.spacing.p16,
    zIndex: 20,
    elevation: 20,
  },
  autocompleteContainer: {
    flex: 0,
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.metrics.borderRadius.lg,
    shadowColor: theme.colors.overlay.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'visible',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: theme.metrics.spacingV.p48,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: theme.metrics.spacing.p8,
  },
  textInput: {
    flex: 1,
    height: theme.metrics.spacingV.p48,
    color: theme.colors.text.primary,
    fontSize: theme.metrics.fontSize.md,
    fontFamily: theme.fonts.regular,
    backgroundColor: 'transparent',
    paddingHorizontal: theme.metrics.spacing.p8,
    paddingVertical: 0,
    margin: 0,
    textAlignVertical: 'center',
  },
  backButton: {
    marginRight: theme.metrics.spacing.p4,
    alignSelf: 'center',
  },
  listView: {
    backgroundColor: theme.colors.background.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
    borderBottomLeftRadius: theme.metrics.borderRadius.lg,
    borderBottomRightRadius: theme.metrics.borderRadius.lg,
    maxHeight: vs(480),
  },
  row: {
    backgroundColor: theme.colors.background.surface,
    paddingVertical: theme.metrics.spacingV.p12,
    paddingHorizontal: theme.metrics.spacing.p16,
    height: 'auto',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border.subtle,
  },
  description: {
    display: 'none',
  },
  poweredContainer: {
    backgroundColor: theme.colors.background.surface,
    borderBottomLeftRadius: theme.metrics.borderRadius.lg,
    borderBottomRightRadius: theme.metrics.borderRadius.lg,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flex: 1,
  },
  iconCircle: {
    width: theme.metrics.spacing.p36,
    height: theme.metrics.spacing.p36,
    borderRadius: theme.metrics.borderRadius.full,
    backgroundColor: theme.colors.background.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.metrics.spacing.p12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    minWidth: 0,
    marginRight: theme.metrics.spacing.p12,
  },
  rowTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.metrics.spacingV.p4,
    flex: 1,
  },
  rowSubtitle: {
    color: theme.colors.text.secondary,
    flex: 1,
  },
  rightArrow: {
    marginLeft: theme.metrics.spacing.p8,
    alignSelf: 'center',
  },
}));
