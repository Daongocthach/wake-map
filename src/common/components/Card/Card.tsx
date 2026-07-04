import { View, Pressable, StyleSheet as RNStyleSheet, useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { useUnistyles } from 'react-native-unistyles';
import { useAnimatedPress } from '@/hooks/useAnimatedPress';
import { styles } from './Card.styles';
import type { CardProps } from './Card.types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Container component with filled, elevated, or outlined variants and optional press support.
 * Also supports a customizable left indicator bar color.
 *
 * @example
 * ```tsx
 * <Card variant="elevated" indicatorColor="#EF4444">
 *   <Text>Card content with red left indicator</Text>
 * </Card>
 * <Card pressable onPress={handlePress} variant="outlined">
 *   <Text>Pressable card</Text>
 * </Card>
 * ```
 */
export function Card({
  variant = 'filled',
  pressable = false,
  onPress,
  indicatorColor,
  indicatorWidth = 4,
  children,
  style,
  ...rest
}: CardProps) {
  const { theme } = useUnistyles();
  const { width: windowWidth } = useWindowDimensions();
  styles.useVariants({ variant });

  const isXs = windowWidth < 576;
  const isLg = windowWidth >= 992;

  const renderContent = () => {
    if (!indicatorColor) return children;

    const flatStyle = RNStyleSheet.flatten(style);
    const borderTopLeftRadius =
      flatStyle?.borderTopLeftRadius ?? flatStyle?.borderRadius ?? theme.metrics.borderRadius.xl;
    const borderBottomLeftRadius =
      flatStyle?.borderBottomLeftRadius ?? flatStyle?.borderRadius ?? theme.metrics.borderRadius.xl;

    return (
      <>
        <View
          style={[
            styles.indicator,
            {
              width: indicatorWidth,
              backgroundColor: indicatorColor,
              borderTopLeftRadius,
              borderBottomLeftRadius,
            },
          ]}
        />
        {children}
      </>
    );
  };

  const getCardStyle = () => {
    if (!indicatorColor) return style;

    const flatStyle = RNStyleSheet.flatten(style);

    // Determine the base left padding of the card before adding indicatorWidth.
    // If paddingLeft or padding is explicitly set on the custom style, use that.
    // Otherwise, default to the responsive layout padding from metrics:
    // xs screen: p12, lg screen: p24, other screens (sm/md): p16.
    let defaultPadding = theme.metrics.spacing.p16;
    if (isXs) {
      defaultPadding = theme.metrics.spacing.p12;
    } else if (isLg) {
      defaultPadding = theme.metrics.spacing.p24;
    }

    const basePaddingLeft = flatStyle?.paddingLeft ?? flatStyle?.padding ?? defaultPadding;

    const paddingLeft =
      typeof basePaddingLeft === 'number' ? basePaddingLeft + indicatorWidth : basePaddingLeft;

    const customPaddingStyle = {
      paddingLeft,
      overflow: flatStyle?.overflow ?? 'visible',
    };

    return [style, customPaddingStyle];
  };

  if (pressable && onPress) {
    return (
      <PressableCard onPress={onPress} style={getCardStyle()} {...rest}>
        {renderContent()}
      </PressableCard>
    );
  }

  return (
    <View style={[styles.card, getCardStyle()]} {...rest}>
      {renderContent()}
    </View>
  );
}

function PressableCard({
  onPress,
  children,
  style,
  ...rest
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: CardProps['style'];
} & Omit<CardProps, 'variant' | 'pressable' | 'onPress' | 'children'>) {
  const { animatedStyle, onPressIn, onPressOut } = useAnimatedPress({ scale: 0.98 });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.card, animatedStyle, style]}
      accessibilityRole="button"
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
