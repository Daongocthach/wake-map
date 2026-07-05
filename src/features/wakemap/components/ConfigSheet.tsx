import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/common/components/Text';

export default function ConfigSheet() {
  const { t } = useTranslation();

  return (
    <View>
      <Text variant="h1">{t('wakemap.title')}</Text>
    </View>
  );
}
