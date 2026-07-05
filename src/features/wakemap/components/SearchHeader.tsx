import { Search, Coffee, ArrowUpRight } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import {
  GooglePlacesAutocomplete,
  type GooglePlacesAutocompleteRef,
  type GooglePlaceData,
} from 'react-native-google-places-autocomplete';
import { useUnistyles, StyleSheet } from 'react-native-unistyles';
import { Icon } from '@/common/components/Icon';
import { IconButton } from '@/common/components/IconButton';
import { Text } from '@/common/components/Text';

interface CustomPlace {
  description: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
      latitude: number;
      longitude: number;
    };
  };
  distance: string;
  detail: string;
}

const PREDEFINED_PLACES: CustomPlace[] = [
  {
    description: 'Cà phê Aha',
    geometry: {
      location: {
        lat: 21.0285,
        lng: 105.8542,
        latitude: 21.0285,
        longitude: 105.8542,
      },
    },
    distance: '0.5 km',
    detail: 'Open until 10 PM',
  },
];

export default function SearchHeader() {
  const { theme } = useUnistyles();
  const ref = useRef<GooglePlacesAutocompleteRef | null>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    ref.current?.setAddressText('Cà phê');
    setSearchText('Cà phê');
  }, []);

  const handleBack = () => {
    ref.current?.blur();
  };

  const renderCustomRow = (rowData: GooglePlaceData) => {
    const customData = rowData as unknown as CustomPlace;
    const title = customData.description || '';
    const distance = customData.distance || '0.5 km';
    const detail = customData.detail || 'Open until 10 PM';

    return (
      <View style={styles.rowContainer}>
        <View style={styles.iconCircle}>
          <Icon icon={Coffee} size={16} color={theme.colors.brand.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text variant="bodySmall" weight="bold" style={styles.rowTitle}>
            {title}
          </Text>
          <Text variant="caption" style={styles.rowSubtitle}>
            {distance} • {detail}
          </Text>
        </View>
        <Icon icon={ArrowUpRight} size={18} variant="muted" style={styles.rightArrow} />
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <GooglePlacesAutocomplete
        ref={ref}
        placeholder="Tìm kiếm..."
        minLength={2}
        fetchDetails={false}
        onPress={() => {}}
        query={{
          key: '',
          language: 'vi',
          types: 'establishment',
        }}
        predefinedPlaces={PREDEFINED_PLACES}
        predefinedPlacesAlwaysVisible={true}
        textInputProps={{
          placeholderTextColor: theme.colors.text.muted,
          value: searchText,
          onChangeText: setSearchText,
          autoFocus: false,
          returnKeyType: 'search',
        }}
        renderLeftButton={() => (
          <IconButton
            icon={Search}
            accessibilityLabel="Search"
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
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    position: 'absolute',
    left: theme.metrics.spacing.p16,
    right: theme.metrics.spacing.p16,
    zIndex: 10,
  },
  autocompleteContainer: {
    flex: 0,
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.metrics.borderRadius.lg,
    shadowColor: theme.colors.overlay.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: theme.metrics.spacingV.p56,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: theme.metrics.spacing.p8,
  },
  textInput: {
    flex: 1,
    height: theme.metrics.spacing.p40,
    color: theme.colors.text.primary,
    fontSize: theme.metrics.fontSize.md,
    fontFamily: theme.fonts.regular,
    backgroundColor: 'transparent',
    paddingHorizontal: theme.metrics.spacing.p8,
    paddingVertical: 0,
    margin: 0,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    alignSelf: 'center',
    textAlignVertical: 'center',
  },
  backButton: {
    marginRight: theme.metrics.spacing.p4,
  },
  clearButton: {
    marginLeft: theme.metrics.spacing.p4,
  },
  listView: {
    backgroundColor: theme.colors.background.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.subtle,
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
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
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
    justifyContent: 'center',
  },
  rowTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.metrics.spacingV.p4,
  },
  rowSubtitle: {
    color: theme.colors.text.secondary,
  },
  rightArrow: {
    marginLeft: theme.metrics.spacing.p8,
  },
}));
