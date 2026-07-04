import { View } from 'react-native';
import { Text } from '../Text';
import { styles } from './DetailRow.styles';
import type { DetailRowProps } from './DetailRow.types';

export function DetailRow({
  label,
  value,
  isLast = false,
  style,
  labelStyle,
  valueStyle,
}: DetailRowProps) {
  return (
    <View style={[styles.detailRow, isLast && styles.lastRow, style]}>
      <Text variant="bodySmall" color="secondary" style={[styles.detailLabel, labelStyle]}>
        {label}
      </Text>
      {typeof value === 'string' ? (
        <Text variant="bodySmall" weight="semibold" style={[styles.detailValue, valueStyle]}>
          {value}
        </Text>
      ) : (
        <View style={styles.valueContainer}>{value}</View>
      )}
    </View>
  );
}
