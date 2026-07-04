import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.metrics.spacing.p12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
    gap: theme.metrics.spacing.p12,
  },
  detailLabel: {
    flexShrink: 0,
  },
  detailValue: {
    color: theme.colors.text.primary,
    flexShrink: 1,
    textAlign: 'right',
  },
  valueContainer: {
    flexShrink: 1,
    alignItems: 'flex-end',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
}));
