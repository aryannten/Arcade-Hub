import React from 'react'

// Mock React Native components and APIs for testing
const View = ({ children, style, ...props }) => React.createElement('View', { style, ...props }, children)
const Text = ({ children, style, ...props }) => React.createElement('Text', { style, ...props }, children)
const TouchableOpacity = ({ children, onPress, onPressIn, onPressOut, style, ...props }) => 
  React.createElement('TouchableOpacity', { onPress, onPressIn, onPressOut, style, ...props }, children)

const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => {
    if (!style) return {}
    if (Array.isArray(style)) {
      return style.reduce((acc, s) => ({ ...acc, ...StyleSheet.flatten(s) }), {})
    }
    return style
  }
}

const Animated = {
  Value: class {
    constructor(value) {
      this._value = value
    }
  },
  View: ({ children, style, ...props }) => React.createElement('Animated.View', { style, ...props }, children),
  timing: (value, config) => ({
    start: (callback) => callback && callback()
  }),
  spring: (value, config) => ({
    start: (callback) => callback && callback()
  }),
  sequence: (animations) => ({
    start: (callback) => callback && callback()
  })
}

const Dimensions = {
  get: (dimension) => {
    if (dimension === 'window') {
      return { width: 375, height: 667 }
    }
    return { width: 375, height: 667 }
  }
}

module.exports = {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform: {
    OS: 'android',
    select: (obj) => obj.android || obj.default
  }
}
