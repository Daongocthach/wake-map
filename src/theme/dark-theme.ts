import type { ThemeColors } from './types';

export const darkColors: ThemeColors = {
  mode: 'dark',

  brand: {
    primary: '#2173F1',
    secondary: '#55CCD5',
    tertiary: '#30D4E1',
    primaryVariant: '#1BA1EF',
    secondaryVariant: '#2764AD',
    onBrand: '#FFFFFF',
  },

  background: {
    app: '#08111F',
    surface: '#0D172A',
    surfaceAlt: '#12203A',
    section: '#142848',
    elevated: '#10203A',
    input: '#162948',
    disabled: '#0A1424',
    modal: '#0D172A',
  },

  text: {
    primary: '#F5F9FF',
    secondary: '#C6DAF3',
    tertiary: '#8CA7CB',
    muted: '#61799F',
    inverse: '#0F172A',
    accent: '#30D4E1',
    link: '#55CCD5',
    linkHover: '#A6E9EE',
    onBrand: '#FFFFFF',
  },

  border: {
    default: '#243D66',
    subtle: '#14233D',
    strong: '#4C6897',
    focus: '#1BA1EF',
    disabled: '#0A1424',
  },

  icon: {
    primary: '#F5F9FF',
    secondary: '#C6DAF3',
    tertiary: '#99B5D8',
    muted: '#5E769A',
    inverse: '#0F172A',
    accent: '#30D4E1',
    onBrand: '#FFFFFF',
  },

  state: {
    success: '#4ADE80',
    successBg: 'rgba(74, 222, 128, 0.18)',
    warning: '#FCC525',
    warningBg: 'rgba(252, 197, 37, 0.2)',
    error: '#F55E50',
    errorBg: 'rgba(245, 94, 80, 0.2)',
    info: '#30D4E1',
    infoBg: 'rgba(48, 212, 225, 0.18)',
    disabled: '#5B6B4A',
    disabledBg: 'rgba(91, 107, 74, 0.1)',
  },

  overlay: {
    modal: 'rgba(0, 0, 0, 0.7)',
    pressed: 'rgba(33, 115, 241, 0.18)',
    hover: 'rgba(33, 115, 241, 0.1)',
    focus: 'rgba(27, 161, 239, 0.24)',
    ripple: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.5)',
  },

  gradient: {
    primary: ['#1BA1EF', '#2173F1'],
    secondary: ['#30D4E1', '#55CCD5'],
    accent: ['#2764AD', '#1BA1EF'],
    success: ['#14532D', '#4ADE80'],
    error: ['#7F1D1D', '#F55E50'],
    warning: ['#7A5A12', '#FCC525'],
    highlight: ['#1B2433', '#30435F'],
  },

  shadow: {
    color: 'rgba(0, 0, 0, 0.5)',
    elevation: 6,
    elevationSmall: 2,
    elevationMedium: 6,
    elevationLarge: 12,
  },
};

export default darkColors;
