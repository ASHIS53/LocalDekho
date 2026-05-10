import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export const COLORS = {
  primary: '#1D9E75',
  primaryLight: '#2ECC71',
  primaryDark: '#148F77',
  accent: '#A3E4D7',
  secondary: '#6C5CE7',
  secondaryLight: '#A29BFE',
  background: '#0F172A',
  surface: 'rgba(255, 255, 255, 0.08)',
  surfaceLight: 'rgba(255, 255, 255, 0.15)',
  text: '#F8FAFC',
  textDim: '#94A3B8',
  white: '#FFFFFF',
  error: '#FF4757',
  success: '#2ECC71',
  warning: '#FFA502',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const SIZES = {
  radius_sm: 8,
  radius_md: 16,
  radius_lg: 24,
  radius_xl: 32,
  width,
  height,
};

export const SHADOWS = {
  light: isWeb ? {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  } : {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: isWeb ? {
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
  } : {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: isWeb ? {
    boxShadow: `0 0 20px ${COLORS.primary}80`
  } : {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  }
};

export const GLASS = {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: SIZES.radius_lg,
  ...(isWeb && { backdropFilter: 'blur(10px)' })
};
