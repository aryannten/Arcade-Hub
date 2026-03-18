import AsyncStorage from '@react-native-async-storage/async-storage'

const THEME_KEY = 'arcade_hub_theme'

export const themes = {
  dark: {
    name: 'dark',
    bg: '#0a1628',
    cardBg: 'rgba(15, 23, 42, 0.85)',
    text: '#e0f2fe',
    textSecondary: '#7dd3fc',
    border: 'rgba(6, 182, 212, 0.2)',
    primary: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  light: {
    name: 'light',
    bg: '#f0f9ff',
    cardBg: 'rgba(255,255,255,0.95)',
    text: '#0c4a6e',
    textSecondary: '#075985',
    border: 'rgba(6, 182, 212, 0.3)',
    primary: '#0891b2',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
  },
}

export function resolveThemeColors(themeColors) {
  if (themeColors) {
    return {
      name: themeColors.name ?? 'dark',
      ...themeColors,
    }
  }

  return {
    name: 'dark',
    bg: themes.dark.bg,
    cardBg: themes.dark.cardBg,
    text: themes.dark.text,
    textSecondary: themes.dark.textSecondary,
    border: themes.dark.border,
    primary: themes.dark.primary,
    success: themes.dark.success,
    warning: themes.dark.warning,
    error: themes.dark.error,
  }
}

export const themeManager = {
  getTheme: async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_KEY)
      return saved === 'light' ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  },

  setTheme: async (theme) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, theme)
      return true
    } catch {
      return false
    }
  },
}
