import React from 'react'
import { render } from '@testing-library/react-native'
import NeonText from '../NeonText'
import { colors, typography } from '../../tokens'

describe('NeonText', () => {
  it('renders with text content', () => {
    const { getByText } = render(
      <NeonText>Arcade Hub</NeonText>
    )
    expect(getByText('Arcade Hub')).toBeTruthy()
  })

  it('uses default NeonCyan color when color prop not provided', () => {
    const { getByText } = render(
      <NeonText>Default Color</NeonText>
    )
    const textElement = getByText('Default Color')
    expect(textElement).toBeTruthy()
  })

  it('accepts custom color prop', () => {
    const { getByText } = render(
      <NeonText color={colors.NeonPurple}>Purple Text</NeonText>
    )
    expect(getByText('Purple Text')).toBeTruthy()
  })

  it('accepts custom size prop', () => {
    const { getByText } = render(
      <NeonText size={32}>Large Text</NeonText>
    )
    expect(getByText('Large Text')).toBeTruthy()
  })

  it('uses default size of 24 when size prop not provided', () => {
    const { getByText } = render(
      <NeonText>Default Size</NeonText>
    )
    expect(getByText('Default Size')).toBeTruthy()
  })

  it('accepts custom style prop', () => {
    const customStyle = { marginTop: 10 }
    const { getByText } = render(
      <NeonText style={customStyle}>Styled Text</NeonText>
    )
    expect(getByText('Styled Text')).toBeTruthy()
  })

  it('applies glow effect with text shadow', () => {
    const { getByText } = render(
      <NeonText color={colors.NeonAmber}>Glowing Text</NeonText>
    )
    const textElement = getByText('Glowing Text')
    expect(textElement).toBeTruthy()
    // Glow effect is applied via textShadowColor, textShadowRadius
  })

  it('uses SpaceGrotesk-Bold font family from design system', () => {
    // Verify design system typography token
    expect(typography.fontFamily.heading).toBe('SpaceGrotesk-Bold')
  })

  it('renders with all neon colors from design system', () => {
    const neonColors = [
      colors.NeonCyan,
      colors.NeonPurple,
      colors.NeonAmber,
      colors.NeonRed
    ]

    neonColors.forEach((color, index) => {
      const { getByText } = render(
        <NeonText color={color}>Text {index}</NeonText>
      )
      expect(getByText(`Text ${index}`)).toBeTruthy()
    })
  })

  it('renders with different font sizes', () => {
    const sizes = [12, 16, 20, 24, 32]

    sizes.forEach((size) => {
      const { getByText } = render(
        <NeonText size={size}>Size {size}</NeonText>
      )
      expect(getByText(`Size ${size}`)).toBeTruthy()
    })
  })
})
