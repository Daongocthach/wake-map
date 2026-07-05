import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native-unistyles';
import { ScreenContainer } from '@/common/components/ScreenContainer';
import { Text } from '@/common/components/Text';

export default function WakeMapScreen() {
  const { t } = useTranslation();

  return (
    <ScreenContainer edges={['top']}>
      <Text variant="h1" style={styles.text}>
        {t('wakemap.title')}
      </Text>
    </ScreenContainer>
  );
}

export const styles = StyleSheet.create((theme) => ({
  text: {
    color: theme.colors.brand.primary,
    fontSize: theme.metrics.fontSize.lg,
  },
}));
