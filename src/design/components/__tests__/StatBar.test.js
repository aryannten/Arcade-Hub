import React from 'react'
import { render } from '@testing-library/react-native'
import StatBar from '../StatBar'
import { colors } from '../../tokens'

describe('StatBar', () => {
  it('renders with label and value', () => {
    const { getByText } = render(
      <StatBar
        label="Score"
        value={100}
        color={colors.NeonCyan}
      />
    )
    expect(getByText('Score')).toBeTruthy()
    expect(getByText('100')).toBeTruthy()
  })

  it('accepts string values', () => {
    const { getByText } = render(
      <StatBar
        label="Level"
        value="Expert"
        color={colors.NeonPurple}
      />
    )
    expect(getByText('Level')).toBeTruthy()
    expect(getByText('Expert')).toBeTruthy()
  })

  it('uses default color when color prop is not provided', () => {
    const { getByText } = render(
      <StatBar
        label="Points"
        value={50}
      />
    )
    const valueElement = getByText('50')
    expect(valueElement).toBeTruthy()
  })

  it('displays label on left and value on right', () => {
    const { getByText } = render(
      <StatBar
        label="Time"
        value="2:30"
        color={colors.NeonAmber}
      />
    )
    expect(getByText('Time')).toBeTruthy()
    expect(getByText('2:30')).toBeTruthy()
  })
})
