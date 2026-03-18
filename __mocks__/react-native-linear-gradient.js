import React from 'react'
import { View } from 'react-native'

// Mock LinearGradient component for testing (expo-linear-gradient)
export function LinearGradient({ children, colors, style, ...props }) {
  return (
    <View style={style} {...props} testID="linear-gradient">
      {children}
    </View>
  )
}

export default LinearGradient

