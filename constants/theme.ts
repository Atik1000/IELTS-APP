/**
 * App theme: colors, gradients, shadows for a modern IELTS app.
 */

import { Platform } from 'react-native';

// Primary palette
const primary = '#6366f1';      // Indigo
const primaryDark = '#4f46e5';
const accent = '#22d3ee';      // Cyan accent
const success = '#10b981';
const warning = '#f59e0b';
const error = '#ef4444';

export const Colors = {
  light: {
    text: '#0f172a',
    textSecondary: '#475569',
    background: '#f8fafc',
    surface: '#ffffff',
    tint: primary,
    tintDark: primaryDark,
    accent,
    success,
    warning,
    error,
    icon: '#64748b',
    tabIconDefault: '#94a3b8',
    tabIconSelected: primary,
    border: '#e2e8f0',
    cardBg: '#ffffff',
  },
  dark: {
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    background: '#0f172a',
    surface: '#1e293b',
    tint: accent,
    tintDark: primary,
    accent: primary,
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    icon: '#94a3b8',
    tabIconDefault: '#64748b',
    tabIconSelected: accent,
    border: '#334155',
    cardBg: '#1e293b',
  },
};

// Gradient colors (for LinearGradient - use expo-linear-gradient)
export const Gradients = {
  primary: ['#6366f1', '#4f46e5'] as const,
  hero: ['#6366f1', '#22d3ee'] as const,
  card: ['#ffffff', '#f8fafc'] as const,
  dark: ['#1e293b', '#0f172a'] as const,
};

// Shadow presets (iOS + Android)
export const Shadows = Platform.select({
  ios: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    button: {
      shadowColor: primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    float: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
  },
  default: {
    card: {
      elevation: 4,
    },
    button: {
      elevation: 6,
    },
    float: {
      elevation: 8,
    },
  },
});

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, monospace",
  },
});
