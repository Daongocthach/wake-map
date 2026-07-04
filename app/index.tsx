import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native-unistyles';
import { ScreenContainer } from '@/common/components/ScreenContainer';
import { Text } from '@/common/components/Text';

export default function WakeMapScreen() {
  const { t } = useTranslation();

  return (
    <ScreenContainer padded={false} style={styles.container}>
      <Text variant="h1">{t('wakemap.title')}</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.app,
  },
  alarmOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(239, 68, 68, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  pulseRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(239, 68, 68, 0.4)',
  },
  alarmCard: {
    width: '85%',
    backgroundColor: theme.colors.background.surface,
    borderRadius: 24,
    padding: theme.metrics.spacing.p24,
    alignItems: 'center',
    shadowColor: theme.colors.shadow.color,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    gap: theme.metrics.spacingV.p16,
  },
  alarmIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmTitle: {
    color: theme.colors.state.error,
    fontSize: theme.fonts.size['3xl'],
    fontWeight: 'bold',
  },
  alarmSubtitle: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  boldDest: {
    color: theme.colors.text.primary,
    fontWeight: 'bold',
  },
  dismissBtn: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    backgroundColor: theme.colors.state.error,
    marginTop: theme.metrics.spacingV.p8,
  },
}));
