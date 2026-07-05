import type { ThemeColors } from './types';

export const lightColors: ThemeColors = {
  mode: 'light',

  brand: {
    primary: '#2173F1',
    secondary: '#2764AD',
    tertiary: '#30D4E1',
    primaryVariant: '#1BA1EF',
    secondaryVariant: '#55CCD5',
    onBrand: '#FFFFFF',
  },

  background: {
    app: '#F2F8FF',
    surface: '#FFFFFF',
    surfaceAlt: '#EAF4FF',
    section: '#DCEBFF',
    elevated: '#F7FBFF',
    input: '#F4FAFF',
    disabled: '#D7E4F6',
    modal: '#FFFFFF',
  },

  text: {
    primary: '#102A5C',
    secondary: '#3E5F92',
    tertiary: '#5F7BA7',
    muted: '#879DBF',
    inverse: '#FFFFFF',
    accent: '#1BA1EF',
    link: '#2173F1',
    linkHover: '#2764AD',
    onBrand: '#FFFFFF',
  },

  border: {
    default: '#C5D8F2',
    subtle: '#E3F0FB',
    strong: '#8FB3E4',
    focus: '#2173F1',
    disabled: '#D7E4F6',
  },

  icon: {
    primary: '#102A5C',
    secondary: '#3E5F92',
    tertiary: '#6A83AB',
    muted: '#97ACCB',
    inverse: '#FFFFFF',
    accent: '#1BA1EF',
    onBrand: '#FFFFFF',
  },

  state: {
    success: '#16A34A',
    successBg: 'rgba(22, 163, 74, 0.12)',
    warning: '#FCC525',
    warningBg: 'rgba(252, 197, 37, 0.18)',
    error: '#F55E50',
    errorBg: 'rgba(245, 94, 80, 0.12)',
    info: '#1BA1EF',
    infoBg: 'rgba(27, 161, 239, 0.14)',
    disabled: '#B0B99C',
    disabledBg: 'rgba(176, 185, 156, 0.1)',
  },

  overlay: {
    modal: 'rgba(0, 0, 0, 0.5)',
    pressed: 'rgba(33, 115, 241, 0.18)',
    hover: 'rgba(33, 115, 241, 0.1)',
    focus: 'rgba(33, 115, 241, 0.2)',
    ripple: 'rgba(255, 255, 255, 0.25)',
    shadow: 'rgba(16, 42, 92, 0.14)',
  },

  gradient: {
    primary: ['#1BA1EF', '#2173F1'],
    secondary: ['#30D4E1', '#2764AD'],
    accent: ['#FCC525', '#1BA1EF'],
    success: ['#1F8F4D', '#16A34A'],
    error: ['#F55E50', '#F87171'],
    warning: ['#FCC525', '#FFD84C'],
    highlight: ['#FFFFFF', '#EAF4FF'],
  },

  shadow: {
    color: 'rgba(16, 42, 92, 0.14)',
    elevation: 4,
    elevationSmall: 2,
    elevationMedium: 4,
    elevationLarge: 8,
  },
};

export default lightColors;
