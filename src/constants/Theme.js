export const COLORS = {
  // Common Colors
  primary: '#0D9488',      // Teal / Emerald
  primaryLight: '#2DD4BF', // Light Teal
  secondary: '#D97706',    // Gold Amber
  secondaryLight: '#F59E0B',
  accent: '#8B5CF6',       // Purple for special items
  
  // Premium Gradients
  primaryGradient: ['#047857', '#0D9488'],     // Rich Emerald to Teal
  goldGradient: ['#B45309', '#D97706', '#F59E0B'], // Multi-stop Gold Amber
  darkGradient: ['#0A0F1D', '#070A14'],        // Elegant dark sky
  lightGradient: ['#FDFCF7', '#FAF6F0'],       // Ivory background gradient
  accentGradient: ['#6D28D9', '#8B5CF6'],      // Deep purple to violet
  
  // Dark Theme Colors
  dark: {
    background: '#070A14',       // Sleek obsidian dark sky
    surface: '#0F1626',          // Slate gray surface
    surfaceAlt: '#1E293B',       // Lighter surface
    text: '#F3F4F6',             // Near white
    textSecondary: '#9CA3AF',    // Medium gray
    textMuted: '#6B7280',        // Dark gray
    border: '#1E293B',           // Dark border
    glassBg: 'rgba(15, 22, 38, 0.75)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    glassBorderGold: 'rgba(217, 119, 6, 0.35)',
    cardBg: 'rgba(15, 22, 38, 0.85)',
    tabBarBg: 'rgba(7, 10, 20, 0.94)',
    tabBarBorder: '#1E293B'
  },
  
  // Light Theme Colors
  light: {
    background: '#FAF6F0',       // Warm Ivory
    surface: '#FFFFFF',          // Pure White
    surfaceAlt: '#F1F5F9',       // Soft slate gray
    text: '#0F172A',             // Dark slate
    textSecondary: '#475569',    // Medium dark slate
    textMuted: '#94A3B8',        // Lighter slate
    border: '#E2E8F0',           // Light gray border
    glassBg: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(13, 148, 136, 0.08)',
    glassBorderGold: 'rgba(217, 119, 6, 0.2)',
    cardBg: 'rgba(255, 255, 255, 0.92)',
    tabBarBg: 'rgba(255, 255, 255, 0.96)',
    tabBarBorder: '#E2E8F0'
  },

  // State colors
  success: '#10B981', // Green
  error: '#EF4444',   // Red
  warning: '#F59E0B', // Yellow
  info: '#3B82F6',    // Blue
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
};
