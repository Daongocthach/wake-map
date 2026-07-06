import { ArrowUpRight, History, MapPin, Search } from 'lucide-react-native';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  GooglePlacesAutocomplete,
  type GooglePlaceData,
  type GooglePlacesAutocompleteRef,
} from 'react-native-google-places-autocomplete';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Icon } from '@/common/components/Icon';
import { IconButton } from '@/common/components/IconButton';
import { Text } from '@/common/components/Text';
import { env } from '@/config/env';
import { vs } from '@/theme/metrics';

interface SearchRowData extends GooglePlaceData {
  isPredefinedPlace?: boolean;
}

const MOCK_SAVED_PLACES = [
  {
    description: 'Nhà - Quận 1',
    geometry: {
      location: {
        lat: 10.7781,
        lng: 106.6996,
        latitude: 10.7781,
        longitude: 106.6996,
      },
    },
  },
  {
    description: 'Công ty - Quận 7',
    geometry: {
      location: {
        lat: 10.7378,
        lng: 106.7218,
        latitude: 10.7378,
        longitude: 106.7218,
      },
    },
  },
  {
    description: 'Quán cà phê - Thảo Điền',
    geometry: {
      location: {
        lat: 10.8032,
        lng: 106.7358,
        latitude: 10.8032,
        longitude: 106.7358,
      },
    },
  },
];

export default function SearchHeader() {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const ref = useRef<GooglePlacesAutocompleteRef | null>(null);

  const handleBack = () => {
    ref.current?.blur();
  };

  const renderCustomRow = (rowData: SearchRowData) => {
    const title = rowData.description || rowData.structured_formatting?.main_text || '';
    const subtitle = rowData.structured_formatting?.secondary_text || t('wakemap.searchResultHint');
    const rightIcon = rowData.isPredefinedPlace ? History : ArrowUpRight;

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
        fetchDetails={false}
        predefinedPlaces={MOCK_SAVED_PLACES}
        predefinedPlacesAlwaysVisible
        keepResultsAfterBlur
        listViewDisplayed
        query={{
          key: env.googleMapApiKey,
          language: 'vi',
          components: 'country:vn',
        }}
        onPress={() => {
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
