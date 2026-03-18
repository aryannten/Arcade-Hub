// Feature: modern-gaming-ui-redesign, Property 2: Component Library Completeness
// **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
//
// Property: For any required component (GlassCard, GradientButton, StatBar, DifficultyBadge, NeonText),
// the component should be importable from the component library and render without errors when provided valid props.

import React from 'react'
import { render } from '@testing-library/react-native'
import fc from 'fast-check'
import GlassCard from '../GlassCard'
import GradientButton from '../GradientButton'
import StatBar from '../StatBar'
import DifficultyBadge from '../DifficultyBadge'
import NeonText from '../NeonText'
import { colors, gradients } from '../../tokens'

describe('Property 2: Component Library Completeness', () => {
  // Test that all 5 required components are importable
  test('all 5 required components are importable', () => {
    expect(GlassCard).toBeDefined()
    expect(GradientButton).toBeDefined()
    expect(StatBar).toBeDefined()
    expect(DifficultyBadge).toBeDefined()
    expect(NeonText).toBeDefined()
    
    expect(typeof GlassCard).toBe('function')
    expect(typeof GradientButton).toBe('function')
    expect(typeof StatBar).toBe('function')
    expect(typeof DifficultyBadge).toBe('function')
    expect(typeof NeonText).toBe('function')
  })

  // Test that GlassCard renders without errors with valid props
  test('GlassCard renders without errors with valid props', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(gradients)),
        (gradient) => {
          const { root } = render(
            <GlassCard gradient={gradient}>
              <></>
            </GlassCard>
          )
          expect(root).toBeTruthy()
        }
      ),
      { numRuns: 100 }
    )
  })

  // Test that GradientButton renders without errors with valid props
  test('GradientButton renders without errors with valid props', () => {
    const gradientArray = Object.values(gradients)
    const labels = ['Start', 'Play', 'Reset', 'Submit', 'Continue']
    
    fc.assert(
      fc.property(
        fc.constantFrom(...gradientArray),
        fc.constantFrom(...labels),
        fc.boolean(),
        (gradient, label, disabled) => {
          const { getByText } = render(
            <GradientButton
              gradient={gradient}
              label={label}
              onPress={() => {}}
              disabled={disabled}
            />
          )
          expect(getByText(label)).toBeTruthy()
        }
      ),
      { numRuns: 100 }
    )
  })

  // Test that StatBar renders without errors with valid props
  test('StatBar renders without errors with valid props', () => {
    const colorArray = Object.values(colors).filter(c => c.startsWith('#'))
    const labels = ['Score', 'Time', 'Lives', 'Level', 'Attempts']
    
    fc.assert(
      fc.property(
        fc.constantFrom(...labels),
        fc.integer({ min: 0, max: 9999 }),
        fc.constantFrom(...colorArray),
        (label, value, color) => {
          const { getByText } = render(
            <StatBar
              label={label}
              value={value}
              color={color}
            />
          )
          expect(getByText(label)).toBeTruthy()
          expect(getByText(String(value))).toBeTruthy()
        }
      ),
      { numRuns: 100 }
    )
  })

  // Test that DifficultyBadge renders without errors with valid props
  test('DifficultyBadge renders without errors with valid props', () => {
    const difficulties = ['Easy', 'Medium', 'Hard']
    const sizes = ['small', 'medium', 'large']
    
    fc.assert(
      fc.property(
        fc.constantFrom(...difficulties),
        fc.constantFrom(...sizes),
        (difficulty, size) => {
          const { getByText } = render(
            <DifficultyBadge
              difficulty={difficulty}
              size={size}
            />
          )
          expect(getByText(difficulty.toUpperCase())).toBeTruthy()
        }
      ),
      { numRuns: 100 }
    )
  })

  // Test that NeonText renders without errors with valid props
  test('NeonText renders without errors with valid props', () => {
    const colorArray = Object.values(colors).filter(c => c.startsWith('#'))
    const texts = ['Arcade Hub', 'Game Over', 'You Win!', 'High Score', 'Level Up']
    const sizes = [12, 16, 20, 24, 32]
    
    fc.assert(
      fc.property(
        fc.constantFrom(...texts),
        fc.constantFrom(...colorArray),
        fc.constantFrom(...sizes),
        (text, color, size) => {
          const { getByText } = render(
            <NeonText color={color} size={size}>
              {text}
            </NeonText>
          )
          expect(getByText(text)).toBeTruthy()
        }
      ),
      { numRuns: 100 }
    )
  })

  // Test that all components render with minimal required props
  test('all components render with minimal required props', () => {
    const components = [
      {
        name: 'GlassCard',
        component: GlassCard,
        props: { children: <></> }
      },
      {
        name: 'GradientButton',
        component: GradientButton,
        props: { gradient: gradients.snake, label: 'Test', onPress: () => {} }
      },
      {
        name: 'StatBar',
        component: StatBar,
        props: { label: 'Test', value: 0, color: colors.NeonCyan }
      },
      {
        name: 'DifficultyBadge',
        component: DifficultyBadge,
        props: { difficulty: 'Medium' }
      },
      {
        name: 'NeonText',
        component: NeonText,
        props: { children: 'Test' }
      }
    ]

    fc.assert(
      fc.property(
        fc.constantFrom(...components),
        (componentConfig) => {
          const Component = componentConfig.component
          const { root } = render(<Component {...componentConfig.props} />)
          expect(root).toBeTruthy()
        }
      ),
      { numRuns: 100 }
    )
  })
})
