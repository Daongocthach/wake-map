import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '@/common/components/ScreenContainer';
import { Text } from '@/common/components/Text';

export default function WakeMapScreen() {
  const { t } = useTranslation();

  return (
    <ScreenContainer edges={['top']}>
      <Text variant="h1">{t('wakemap.title')}</Text>
    </ScreenContainer>
  );
}
