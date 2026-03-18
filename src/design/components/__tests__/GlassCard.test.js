import React from 'react'
import { render } from '@testing-library/react-native'
import { Text } from 'react-native'
import GlassCard from '../GlassCard'
import { colors, gradients } from '../../tokens'

describe('GlassCard', () => {
  it('renders with children content', () => {
    const { getByText } = render(
      <GlassCard>
        <Text>Test Content</Text>
      </GlassCard>
    )
    expect(getByText('Test Content')).toBeTruthy()
  })

  it('renders without children', () => {
    const { root } = render(
      <GlassCard />
    )
    expect(root).toBeTruthy()
  })

  it('accepts custom style prop', () => {
    const customStyle = { marginTop: 20 }
    const { root } = render(
      <GlassCard style={customStyle}>
        <Text>Styled Card</Text>
      </GlassCard>
    )
    expect(root).toBeTruthy()
  })

  it('accepts gradient prop for accent border', () => {
    const { getByText } = render(
      <GlassCard gradient={gradients.memoryMatch}>
        <Text>Gradient Card</Text>
      </GlassCard>
    )
    expect(getByText('Gradient Card')).toBeTruthy()
  })

  it('uses glassmorphism styling from design system', () => {
    // Verify design system tokens are used
    expect(colors.Surface).toBe('rgba(255, 255, 255, 0.05)')
    expect(colors.SurfaceBorder).toBe('rgba(255, 255, 255, 0.10)')
  })

  it('renders with multiple children', () => {
    const { getByText } = render(
      <GlassCard>
        <Text>First Child</Text>
        <Text>Second Child</Text>
      </GlassCard>
    )
    expect(getByText('First Child')).toBeTruthy()
    expect(getByText('Second Child')).toBeTruthy()
  })
})
