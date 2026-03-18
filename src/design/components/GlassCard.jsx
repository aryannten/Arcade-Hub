import React from 'react'
import { View, StyleSheet } from 'react-native'
import { colors, spacing } from '../tokens'

/**
 * GlassCard Component
 * 
 * Reusable glassmorphism container for content grouping.
 * Features semi-transparent background with subtle border.
 * 
 * @param {ReactNode} children - Content to render inside card
 * @param {StyleProp} style - Additional styles to merge
 * @param {array} gradient - Optional gradient array for accent border
 */
export default function GlassCard({ children, style, gradient }) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.Surface,
    borderWidth: 1,
    borderColor: colors.SurfaceBorder,
    borderRadius: spacing.lg,
    padding: spacing.lg
  }
})
