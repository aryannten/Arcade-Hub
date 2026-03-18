import React, { useRef } from 'react'
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { spacing, typography, colors } from '../tokens'

/**
 * GradientButton Component
 * 
 * Interactive button with gradient background and press animation.
 * Enforces minimum 48px height for touch target accessibility.
 * 
 * @param {function} onPress - Press handler
 * @param {array} gradient - 2-color gradient array
 * @param {string} label - Button text
 * @param {string} icon - Optional icon name
 * @param {boolean} disabled - Disabled state
 * @param {StyleProp} style - Additional styles
 */
export default function GradientButton({ 
  onPress, 
  gradient, 
  label, 
  icon, 
  disabled = false, 
  style 
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true
    }).start()
  }

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true
    }).start()
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.9}
      style={[styles.touchable, style]}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            disabled && styles.disabled
          ]}
        >
          <Text style={styles.label}>{label}</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  touchable: {
    minHeight: 48
  },
  gradient: {
    minHeight: 48,
    borderRadius: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    justifyContent: 'center',
    alignItems: 'center'
  },
  disabled: {
    opacity: 0.5
  },
  label: {
    color: colors.TextPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    textAlign: 'center'
  }
})
