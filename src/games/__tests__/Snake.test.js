import React from 'react'
import { render } from '@testing-library/react-native'
import { Animated, Image } from 'react-native'
import Snake from '../Snake'
import { shadows } from '../../design/tokens'

describe('Snake - Food Animation and Neon Glow', () => {
  const mockOnBack = jest.fn()

  it('applies foodPulseAnim to Animated.View wrapping Image', () => {
    const { UNSAFE_root } = render(
      <Snake onBack={mockOnBack} />
    )

    // Find all Animated.View components
    const animatedViews = UNSAFE_root.findAllByType(Animated.View)
    
    // Find the food Animated.View (it should have transform with scale)
    const foodAnimatedView = animatedViews.find(view => {
      const style = view.props.style
      if (Array.isArray(style)) {
        return style.some(s => s && s.transform && Array.isArray(s.transform))
      }
      return false
    })

    expect(foodAnimatedView).toBeDefined()

    // Verify the transform contains scale animation
    const styles = Array.isArray(foodAnimatedView.props.style) 
      ? foodAnimatedView.props.style 
      : [foodAnimatedView.props.style]
    
    const transformStyle = styles.find(s => s && s.transform)
    expect(transformStyle).toBeDefined()
    expect(transformStyle.transform).toBeDefined()
    expect(Array.isArray(transformStyle.transform)).toBe(true)
    
    // Verify scale transform exists
    const scaleTransform = transformStyle.transform.find(t => t.scale !== undefined)
    expect(scaleTransform).toBeDefined()
    expect(scaleTransform.scale).toBeInstanceOf(Animated.Value)
  })

  it('preserves shadows.neonGlow effect on food Animated.View', () => {
    const { UNSAFE_root } = render(
      <Snake onBack={mockOnBack} />
    )

    // Find all Animated.View components
    const animatedViews = UNSAFE_root.findAllByType(Animated.View)
    
    // Find the food Animated.View
    const foodAnimatedView = animatedViews.find(view => {
      const style = view.props.style
      if (Array.isArray(style)) {
        return style.some(s => s && s.transform && Array.isArray(s.transform))
      }
      return false
    })

    expect(foodAnimatedView).toBeDefined()

    // Get all styles applied to the food view
    const styles = Array.isArray(foodAnimatedView.props.style) 
      ? foodAnimatedView.props.style 
      : [foodAnimatedView.props.style]

    // Flatten styles to check for neonGlow properties
    const flatStyle = styles.reduce((acc, style) => ({ ...acc, ...style }), {})

    // Verify neonGlow shadow properties are present
    expect(flatStyle.shadowColor).toBe(shadows.neonGlow.shadowColor)
    expect(flatStyle.shadowOpacity).toBe(shadows.neonGlow.shadowOpacity)
    expect(flatStyle.shadowRadius).toBe(shadows.neonGlow.shadowRadius)
    expect(flatStyle.elevation).toBe(shadows.neonGlow.elevation)
  })

  it('wraps Image component inside Animated.View with animation', () => {
    const { UNSAFE_root } = render(
      <Snake onBack={mockOnBack} />
    )

    // Find all Animated.View components
    const animatedViews = UNSAFE_root.findAllByType(Animated.View)
    
    // Find the food Animated.View
    const foodAnimatedView = animatedViews.find(view => {
      const style = view.props.style
      if (Array.isArray(style)) {
        return style.some(s => s && s.transform && Array.isArray(s.transform))
      }
      return false
    })

    expect(foodAnimatedView).toBeDefined()

    // Verify Image component is a child of this Animated.View
    const images = foodAnimatedView.findAllByType(Image)
    expect(images.length).toBeGreaterThan(0)
  })
})
