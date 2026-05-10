import { Platform } from 'react-native';

export const theme = {
  colors: {
    bg: '#0A0A0F',
    card: '#13131A',
    surface: '#1C1C27',
    primary: '#1D9E75',
    primaryLight: '#2ECC71',
    primaryDark: '#0D7A5A',
    primaryGlow: 'rgba(29,158,117,0.3)',
    accent: '#FFD700',
    text: '#FFFFFF',
    textSecondary: '#8888AA',
    border: 'rgba(255,255,255,0.08)',
    error: '#FF5252',
    success: '#00E676',
    warning: '#F1C40F',
  },
  gradients: {
    primary: ['#1D9E75', '#0D7A5A'],
    blue: ['#1D9E75', '#00C9FF'],
    card: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'],
    dark: ['#13131A', '#0A0A0F'],
    image: ['transparent', 'rgba(0,0,0,0.8)'],
    glow: ['rgba(29,158,117,0.4)', 'transparent'],
  },
  radius: {
    xs: 4,
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    xxl: 36,
    full: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  shadows: {
    primary: Platform.select({
      web: {
        boxShadow: '0 10px 20px rgba(29, 158, 117, 0.3)',
      },
      default: {
        shadowColor: '#1D9E75',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
      }
    }),
    glow: Platform.select({
      web: {
        boxShadow: '0 0 15px rgba(29, 158, 117, 0.5)',
      },
      default: {
        shadowColor: '#1D9E75',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 5,
      }
    })
  }
}
