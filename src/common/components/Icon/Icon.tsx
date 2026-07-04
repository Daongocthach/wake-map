import type { LucideIcon } from 'lucide-react-native';
import type { ViewStyle } from 'react-native';
import { View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

type IconVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'muted'
  | 'inverse'
  | 'accent'
  | 'onBrand';
type IconSizeVariant = 'sm' | 'md' | 'lg';

export interface IconProps {
  icon: LucideIcon;
  variant?: IconVariant;
  size?: number;
  sizeVariant?: IconSizeVariant;
  color?: string;
  style?: ViewStyle;
}

export function Icon({
  icon: LucideIcon,
  variant = 'primary',
  size,
  sizeVariant = 'md',
  color,
  style,
}: IconProps) {
  const { theme } = useUnistyles();

  const resolvedColorMap: Record<IconVariant, string> = {
    primary: theme.colors.icon.primary,
    secondary: theme.colors.icon.secondary,
    tertiary: theme.colors.icon.tertiary,
    muted: theme.colors.icon.muted,
    inverse: theme.colors.icon.inverse,
    accent: theme.colors.icon.accent,
    onBrand: theme.colors.icon.onBrand,
  };

  const resolvedSizeMap: Record<IconSizeVariant, number> = {
    sm: theme.metrics.iconSize.xs,
    md: theme.metrics.iconSize.sm,
    lg: theme.metrics.iconSize.md,
  };

  const iconComponent = (
    <LucideIcon
      size={size ?? resolvedSizeMap[sizeVariant]}
      color={color ?? resolvedColorMap[variant]}
      strokeWidth={2}
      absoluteStrokeWidth
    />
  );

  if (style) {
    return <View style={style}>{iconComponent}</View>;
  }

  return iconComponent;
}

export type { IconSizeVariant, IconVariant };
