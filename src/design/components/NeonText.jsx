import React from 'react'
import { Text, StyleSheet } from 'react-native'
import { typography, colors } from '../tokens'

/**
 * NeonText Component
 * 
 * Text with neon glow effect using text shadows.
 * Uses SpaceGrotesk-Bold font family for emphasis.
 * 
 * @param {string} children - Text content
 * @param {string} color - Neon color for text and glow
 * @param {number} size - Font size (default: 24)
 * @param {StyleProp} style - Additional styles
 */
export default function NeonText({ children, color = colors.NeonCyan, size = 24, style, ...props }) {
  return (
    <Text 
      style={[
        styles.text,
        {
          color: color,
          fontSize: size,
          textShadowColor: color,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 10
        },
        style
      ]}
      {...props}
    >
      {children}
    </Text>
  )
}

const styles = StyleSheet.create({
  text: {
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold'
  }
})
