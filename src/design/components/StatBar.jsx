import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, typography } from '../tokens'

/**
 * StatBar Component
 * 
 * Display numeric statistics with label and value.
 * Features glassmorphism background with flexbox layout.
 * 
 * @param {string} label - Stat label
 * @param {number|string} value - Stat value
 * @param {string} color - Accent color for value
 * @param {string} icon - Optional icon name
 */
export default function StatBar({ label, value, color, icon, colors: themeColors }) {
  return (
    <View style={[styles.container, themeColors && { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
      <Text style={[styles.label, themeColors && { color: themeColors.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: color || colors.NeonCyan }]}>
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.Surface,
    borderWidth: 1,
    borderColor: colors.SurfaceBorder,
    borderRadius: spacing.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    color: colors.TextMuted,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body
  },
  value: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold'
  }
})
