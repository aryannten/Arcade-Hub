import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, typography } from '../tokens'

/**
 * DifficultyBadge Component
 * 
 * Color-coded difficulty indicator with size variants.
 * Easy (green), Medium (amber), Hard (red).
 * 
 * @param {string} difficulty - 'Easy' | 'Medium' | 'Hard'
 * @param {string} size - 'small' | 'medium' | 'large' (default: 'medium')
 */
export default function DifficultyBadge({ difficulty, size = 'medium' }) {
  const difficultyColors = {
    easy: colors.Success,
    medium: colors.NeonAmber,
    hard: colors.Danger
  }

  const normalizedDifficulty = difficulty?.toLowerCase() || 'medium'
  const backgroundColor = difficultyColors[normalizedDifficulty] || difficultyColors.medium

  const sizeStyles = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large
  }

  const textSizeStyles = {
    small: styles.textSmall,
    medium: styles.textMedium,
    large: styles.textLarge
  }

  return (
    <View style={[styles.badge, sizeStyles[size], { backgroundColor }]}>
      <Text style={[styles.text, textSizeStyles[size]]}>
        {difficulty?.toUpperCase() || 'MEDIUM'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center'
  },
  small: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  medium: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  large: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  text: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  textSmall: {
    fontSize: typography.fontSize.xs
  },
  textMedium: {
    fontSize: typography.fontSize.sm
  },
  textLarge: {
    fontSize: typography.fontSize.md
  }
})
