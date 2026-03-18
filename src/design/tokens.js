// Design System Tokens
// Feature: modern-gaming-ui-redesign
// Centralized design tokens for colors, gradients, spacing, typography, and shadows

export const colors = {
  // Base colors
  Background: '#080C14',
  Surface: 'rgba(255, 255, 255, 0.05)',
  SurfaceBorder: 'rgba(255, 255, 255, 0.10)',
  
  // Neon colors
  NeonCyan: '#06B6D4',
  NeonPurple: '#7C3AED',
  NeonAmber: '#F59E0B',
  NeonRed: '#EF4444',
  
  // Text colors
  TextPrimary: '#E0F2FE',
  TextMuted: '#7DD3FC',
  
  // Semantic colors
  Success: '#10B981',
  Danger: '#EF4444'
}

export const gradients = {
  memoryMatch: ['#7C3AED', '#4C1D95'],
  reactionTest: ['#10B981', '#064E3B'],
  numberGuesser: ['#3B82F6', '#1E3A8A'],
  rockPaperScissors: ['#F59E0B', '#92400E'],
  ticTacToe: ['#EF4444', '#7F1D1D'],
  snake: ['#06B6D4', '#164E63'],
  infiniteRacing: ['#F97316', '#7C2D12'],
  flappyBird: ['#38BDF8', '#0C4A6E'],
  breakout: ['#EC4899', '#831843']
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
}

export const typography = {
  fontFamily: {
    heading: 'SpaceGrotesk-Bold',
    body: 'Outfit-Regular'
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32
  }
}

export const shadows = {
  neonGlow: {
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8
  },
  neonGlowPurple: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8
  },
  neonGlowAmber: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8
  }
}
