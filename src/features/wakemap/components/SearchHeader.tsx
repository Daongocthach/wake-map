import { ArrowLeft, ArrowUpRight, History, List, MapPin, Search, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Platform, View } from 'react-native';
import {
  GooglePlacesAutocomplete,
  type GooglePlaceData,
  type GooglePlaceDetail,
  type GooglePlacesAutocompleteRef,
} from 'react-native-google-places-autocomplete';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import type { RecentPlace, WakeMapPlace } from '../types';
import { Icon } from '@/common/components/Icon';
import { IconButton } from '@/common/components/IconButton';
import { Text } from '@/common/components/Text';
import { env } from '@/config/env';
import { vs } from '@/theme/metrics';

interface SearchHeaderProps {
  onPlaceSelect?: (place: WakeMapPlace) => void;
  savedPlaces: WakeMapPlace[];
  recentPlaces: RecentPlace[];
  onRemoveSaved: (place: WakeMapPlace) => void;
  onRemoveRecent: (placeId: string) => void;
}

interface CustomPlaceData {
  description: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
      latitude: number;
      longitude: number;
    };
  };
  isHeader?: boolean;
  isSavedPlace?: boolean;
  isRecentPlace?: boolean;
  placeObj?: WakeMapPlace;
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
  detail: GooglePlaceDetail | null,
  savedPlaces: WakeMapPlace[],
  recentPlaces: RecentPlace[]
): WakeMapPlace | null {
  const customData = data as unknown as CustomPlaceData;
  if (customData.placeObj) {
    return customData.placeObj;
  }

  const title = data.description || data.structured_formatting?.main_text || '';
  const savedPlace =
    savedPlaces.find((place) => place.title === title) ||
    recentPlaces.find((place) => place.title === title);
  const subtitle = data.structured_formatting?.secondary_text || savedPlace?.subtitle || '';
  const detailLocation = detail?.location ?? detail?.geometry.location;
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

export default function SearchHeader({
  onPlaceSelect,
  savedPlaces,
  recentPlaces,
  onRemoveSaved,
  onRemoveRecent,
}: SearchHeaderProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const ref = useRef<GooglePlacesAutocompleteRef | null>(null);
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const shouldShowSearchResults = isFocused;

  const handleBack = () => {
    ref.current?.blur();
    Keyboard.dismiss();
  };

  const handleClear = () => {
    ref.current?.clear();
    setSearchText('');
  };

  const renderCustomRow = (rowData: GooglePlaceData) => {
    const customData = rowData as unknown as CustomPlaceData;

    if (customData.isHeader) {
      const isRecent = customData.description === '__HEADER__:recent';
      return (
        <View style={styles.headerRowInner}>
          <Text variant="caption" weight="bold" style={styles.headerRowText}>
            {isRecent ? t('wakemap.recentPlaces') : t('wakemap.savedPlaces')}
          </Text>
        </View>
      );
    }

    const title = rowData.description || rowData.structured_formatting?.main_text || '';
    const subtitle =
      rowData.structured_formatting?.secondary_text ||
      customData.placeObj?.subtitle ||
      t('wakemap.searchResultHint');

    let leftIcon = MapPin;
    let leftIconColor = theme.colors.brand.primary;
    const isSavedOrRecent = customData.isSavedPlace || customData.isRecentPlace;

    if (customData.isSavedPlace) {
      leftIcon = List;
      leftIconColor = theme.colors.state.success;
    } else if (customData.isRecentPlace) {
      leftIcon = History;
      leftIconColor = theme.colors.text.muted;
    }

    const handleDelete = () => {
      if (customData.placeObj) {
        if (customData.isSavedPlace) {
          onRemoveSaved(customData.placeObj);
        } else if (customData.isRecentPlace) {
          onRemoveRecent(customData.placeObj.id);
        }
      }
    };

    return (
      <View style={styles.rowContainer}>
        <View style={styles.iconCircle}>
          <Icon icon={leftIcon} size={16} color={leftIconColor} />
        </View>

        <View style={styles.textContainer}>
          <Text variant="bodySmall" weight="bold" style={styles.rowTitle}>
            {title}
          </Text>
          <Text variant="caption" style={styles.rowSubtitle}>
            {subtitle}
          </Text>
        </View>

        {isSavedOrRecent ? (
          <IconButton
            icon={X}
            size="sm"
            variant="ghost"
            accessibilityLabel={t('common.clear')}
            onPress={handleDelete}
            style={styles.deleteItemButton}
          />
        ) : (
          <Icon icon={ArrowUpRight} size={18} variant="muted" style={styles.rightArrow} />
        )}
      </View>
    );
  };

  // Build predefined places dynamically
  const predefinedPlaces: CustomPlaceData[] = [];

  if (savedPlaces && savedPlaces.length > 0) {
    predefinedPlaces.push({
      description: '__HEADER__:saved',
      isHeader: true,
      geometry: {
        location: {
          lat: 0,
          lng: 0,
          latitude: 0,
          longitude: 0,
        },
      },
    });
    savedPlaces.forEach((place) => {
      predefinedPlaces.push({
        description: place.title,
        isSavedPlace: true,
        placeObj: place,
        geometry: {
          location: {
            lat: place.coordinate.latitude,
            lng: place.coordinate.longitude,
            latitude: place.coordinate.latitude,
            longitude: place.coordinate.longitude,
          },
        },
      });
    });
  }

  if (recentPlaces && recentPlaces.length > 0) {
    predefinedPlaces.push({
      description: '__HEADER__:recent',
      isHeader: true,
      geometry: {
        location: {
          lat: 0,
          lng: 0,
          latitude: 0,
          longitude: 0,
        },
      },
    });
    recentPlaces.forEach((place) => {
      predefinedPlaces.push({
        description: place.title,
        isRecentPlace: true,
        placeObj: place,
        geometry: {
          location: {
            lat: place.coordinate.latitude,
            lng: place.coordinate.longitude,
            latitude: place.coordinate.latitude,
            longitude: place.coordinate.longitude,
          },
        },
      });
    });
  }

  const predefinedPlacesKey = `${(savedPlaces || []).map((p) => p.id).join(',')}_${(recentPlaces || []).map((p) => p.id).join(',')}`;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <GooglePlacesAutocomplete
        key={predefinedPlacesKey}
        ref={ref}
        placeholder={t('wakemap.searchPlaceholder')}
        minLength={shouldShowSearchResults ? 2 : Number.MAX_SAFE_INTEGER}
        debounce={250}
        fetchDetails
        predefinedPlaces={shouldShowSearchResults ? predefinedPlaces : []}
        listViewDisplayed={shouldShowSearchResults}
        query={{
          key: env.googleMapApiKey,
          language: 'vi',
          components: 'country:vn',
        }}
        onPress={(data, detail) => {
          const customData = data as unknown as CustomPlaceData;
          if (customData.isHeader) {
            // Keep focused and do not trigger select for header rows
            return;
          }

          const place = createWakeMapPlace(data, detail, savedPlaces, recentPlaces);

          if (place) {
            onPlaceSelect?.(place);
          }

          setSearchText('');
          ref.current?.blur();
        }}
        textInputProps={{
          placeholderTextColor: theme.colors.text.muted,
          autoCorrect: false,
          autoCapitalize: 'none',
          returnKeyType: 'search',
          clearButtonMode: 'while-editing',
          onChangeText: setSearchText,
          onFocus: () => setIsFocused(true),
          onBlur: () => setIsFocused(false),
        }}
        renderLeftButton={() => {
          const leftIcon = isFocused ? ArrowLeft : Search;
          return (
            <IconButton
              icon={leftIcon}
              size="sm"
              accessibilityLabel={isFocused ? t('common.back') : t('common.search')}
              onPress={handleBack}
              style={styles.backButton}
            />
          );
        }}
        renderRightButton={() =>
          Platform.OS === 'android' && searchText.length > 0 ? (
            <IconButton
              icon={X}
              size="sm"
              variant="ghost"
              accessibilityLabel={t('common.clear')}
              onPress={handleClear}
              style={styles.clearButton}
            />
          ) : null
        }
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
    paddingRight: Platform.OS === 'android' ? theme.metrics.spacing.p36 : theme.metrics.spacing.p8,
    paddingVertical: 0,
    margin: 0,
    textAlignVertical: 'center',
  },
  backButton: {
    marginRight: theme.metrics.spacing.p4,
    alignSelf: 'center',
  },
  clearButton: {
    marginLeft: theme.metrics.spacing.p4,
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
  deleteItemButton: {
    alignSelf: 'center',
    marginLeft: theme.metrics.spacing.p8,
  },
  headerRowInner: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: theme.metrics.spacingV.p4,
  },
  headerRowText: {
    color: theme.colors.text.muted,
    textTransform: 'uppercase',
    fontSize: theme.metrics.fontSize.xs,
    letterSpacing: 0.5,
  },
}));
