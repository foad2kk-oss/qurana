export const COLORS = {
  // Common Colors
  primary: '#0D9488',
  primaryLight: '#2DD4BF',
  secondary: '#D97706',
  secondaryLight: '#F59E0B',
  accent: '#8B5CF6',

  // Premium Gradients
  primaryGradient: ['#047857', '#0D9488'],
  goldGradient: ['#B45309', '#D97706', '#F59E0B'],
  darkGradient: ['#0A0F1D', '#070A14'],
  lightGradient: ['#FDFCF7', '#FAF6F0'],
  accentGradient: ['#6D28D9', '#8B5CF6'],
  tealGoldGradient: ['#047857', '#0D9488', '#D97706'],
  nightSkyGradient: ['#0A0F1D', '#0F1A2E', '#0D9488'],

  // Dark Theme
  dark: {
    background: '#070A14',
    surface: '#0F1626',
    surfaceAlt: '#1E293B',
    surfaceGlow: '#0F2030',
    text: '#F3F4F6',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    border: '#1E293B',
    borderGlow: 'rgba(13, 148, 136, 0.4)',
    glassBg: 'rgba(15, 22, 38, 0.75)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    glassBorderGold: 'rgba(217, 119, 6, 0.35)',
    glassBorderTeal: 'rgba(13, 148, 136, 0.35)',
    cardBg: 'rgba(15, 22, 38, 0.85)',
    tabBarBg: 'rgba(7, 10, 20, 0.97)',
    tabBarBorder: '#1E293B',
    starColor: 'rgba(217, 119, 6, 0.15)',
  },

  // Light Theme
  light: {
    background: '#FAF6F0',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F5F9',
    surfaceGlow: '#F0FDF9',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    borderGlow: 'rgba(13, 148, 136, 0.25)',
    glassBg: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(13, 148, 136, 0.08)',
    glassBorderGold: 'rgba(217, 119, 6, 0.2)',
    glassBorderTeal: 'rgba(13, 148, 136, 0.2)',
    cardBg: 'rgba(255, 255, 255, 0.92)',
    tabBarBg: 'rgba(255, 255, 255, 0.98)',
    tabBarBorder: '#E2E8F0',
    starColor: 'rgba(217, 119, 6, 0.08)',
  },

  // State colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,

  fontXs: 12,
  fontSm: 14,
  fontMd: 16,
  fontLg: 18,
  fontXl: 22,
  fontXxl: 28,
  fontQuran: 32,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  teal: {
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  gold: {
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
};
