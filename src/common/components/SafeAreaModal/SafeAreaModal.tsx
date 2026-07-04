import { X } from 'lucide-react-native';
import { Modal, Pressable, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from '@/common/components/IconButton';
import { Text } from '@/common/components/Text';
import { styles } from './SafeAreaModal.styles';
import type { SafeAreaModalProps } from './SafeAreaModal.types';

export function SafeAreaModal({
  visible,
  onDismiss,
  children,
  title,
  dismissOnBackdropPress = true,
  showCloseButton = true,
  backdropStyle,
  cardStyle,
  contentStyle,
  closeAccessibilityLabel,
}: SafeAreaModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Pressable
        style={[styles.backdrop, backdropStyle]}
        onPress={dismissOnBackdropPress ? onDismiss : undefined}
      >
        <Pressable style={[styles.card, cardStyle]} onPress={() => {}}>
          <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
            {showCloseButton ? (
              <View style={[styles.closeButton, { top: insets.top + 12 }]}>
                <IconButton
                  icon={X}
                  variant="secondary"
                  size="md"
                  onPress={onDismiss}
                  accessibilityLabel={closeAccessibilityLabel}
                />
              </View>
            ) : null}

            <View style={[styles.content, contentStyle]}>
              {title ? (
                <Text variant="h3" style={styles.title}>
                  {title}
                </Text>
              ) : null}
              {children}
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
