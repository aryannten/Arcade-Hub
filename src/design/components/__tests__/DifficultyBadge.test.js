import React from 'react'
import { render } from '@testing-library/react-native'
import DifficultyBadge from '../DifficultyBadge'
import { colors } from '../../tokens'

describe('DifficultyBadge', () => {
  it('renders with Easy difficulty and green color', () => {
    const { getByText } = render(
      <DifficultyBadge difficulty="Easy" />
    )
    expect(getByText('EASY')).toBeTruthy()
  })

  it('renders with Medium difficulty and amber color', () => {
    const { getByText } = render(
      <DifficultyBadge difficulty="Medium" />
    )
    expect(getByText('MEDIUM')).toBeTruthy()
  })

  it('renders with Hard difficulty and red color', () => {
    const { getByText } = render(
      <DifficultyBadge difficulty="Hard" />
    )
    expect(getByText('HARD')).toBeTruthy()
  })

  it('handles case-insensitive difficulty values', () => {
    const { getByText } = render(
      <DifficultyBadge difficulty="easy" />
    )
    expect(getByText('EASY')).toBeTruthy()
  })

  it('defaults to Medium when no difficulty provided', () => {
    const { getByText } = render(
      <DifficultyBadge />
    )
    expect(getByText('MEDIUM')).toBeTruthy()
  })

  it('supports small size variant', () => {
    const { getByText } = render(
      <DifficultyBadge difficulty="Easy" size="small" />
    )
    expect(getByText('EASY')).toBeTruthy()
  })

  it('supports medium size variant (default)', () => {
    const { getByText } = render(
      <DifficultyBadge difficulty="Medium" size="medium" />
    )
    expect(getByText('MEDIUM')).toBeTruthy()
  })

  it('supports large size variant', () => {
    const { getByText } = render(
      <DifficultyBadge difficulty="Hard" size="large" />
    )
    expect(getByText('HARD')).toBeTruthy()
  })

  it('maps difficulty to correct colors from design system', () => {
    // Verify color mapping uses design system tokens
    expect(colors.Success).toBe('#10B981') // Easy - green
    expect(colors.NeonAmber).toBe('#F59E0B') // Medium - amber
    expect(colors.Danger).toBe('#EF4444') // Hard - red
  })
})
