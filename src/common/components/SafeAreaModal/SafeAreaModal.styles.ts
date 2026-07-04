import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay.modal,
    justifyContent: 'center',
    padding: theme.metrics.spacing.p16,
  },
  card: {
    maxHeight: '92%',
    borderRadius: theme.metrics.borderRadius.xl,
    backgroundColor: theme.colors.background.modal,
    overflow: 'hidden',
  },
  safeArea: {
    position: 'relative',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.metrics.spacing.p20,
    paddingTop: theme.metrics.spacingV.p56,
    paddingBottom: theme.metrics.spacingV.p20,
  },
  title: {
    marginBottom: theme.metrics.spacingV.p12,
  },
  closeButton: {
    position: 'absolute',
    top: theme.metrics.spacingV.p12,
    right: theme.metrics.spacing.p12,
    zIndex: 1,
  },
}));
