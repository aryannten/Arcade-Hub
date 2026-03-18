// Feature: modern-gaming-ui-redesign, Property 1: Design System Completeness
// **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 18.1, 18.6**
//
// Property: For any required design token category (colors, gradients, spacing, typography, shadows),
// the Design System module should export an object containing all specified tokens with valid values.

import fc from 'fast-check'
import { colors, gradients, spacing, typography, shadows } from '../tokens'

describe('Property 1: Design System Completeness', () => {
  // Test that all required color tokens exist and have valid values
  test('all required color tokens exist with valid hex or rgba values', () => {
    const requiredColorTokens = [
      'Background',
      'Surface',
      'SurfaceBorder',
      'NeonCyan',
      'NeonPurple',
      'NeonAmber',
      'NeonRed',
      'TextPrimary',
      'TextMuted',
      'Success',
      'Danger'
    ]

    fc.assert(
      fc.property(
        fc.constantFrom(...requiredColorTokens),
        (tokenName) => {
          // Token must exist
          expect(colors).toHaveProperty(tokenName)
          
          // Token must be a string
          expect(typeof colors[tokenName]).toBe('string')
          
          // Token must be valid hex (#RRGGBB or #RRGGBBAA) or rgba() format
          const colorValue = colors[tokenName]
          const isValidHex = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(colorValue)
          const isValidRgba = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/.test(colorValue)
          
          expect(isValidHex || isValidRgba).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  // Test that all 9 game gradients exist and have exactly 2 color stops
  test('all 9 game gradients have exactly 2 valid color stops', () => {
    const requiredGradients = [
      'memoryMatch',
      'reactionTest',
      'numberGuesser',
      'rockPaperScissors',
      'ticTacToe',
      'snake',
      'infiniteRacing',
      'flappyBird',
      'breakout'
    ]

    fc.assert(
      fc.property(
        fc.constantFrom(...requiredGradients),
        (gradientName) => {
          // Gradient must exist
          expect(gradients).toHaveProperty(gradientName)
          
          // Gradient must be an array
          expect(Array.isArray(gradients[gradientName])).toBe(true)
          
          // Gradient must have exactly 2 color stops
          expect(gradients[gradientName]).toHaveLength(2)
          
          // Each color stop must be a valid hex color
          gradients[gradientName].forEach(color => {
            expect(typeof color).toBe('string')
            expect(/^#[0-9A-Fa-f]{6}$/.test(color)).toBe(true)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  // Test that all spacing tokens exist and have valid numeric values
  test('all spacing tokens exist with valid numeric values', () => {
    const requiredSpacingTokens = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']
    const expectedValues = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 }

    fc.assert(
      fc.property(
        fc.constantFrom(...requiredSpacingTokens),
        (tokenName) => {
          // Token must exist
          expect(spacing).toHaveProperty(tokenName)
          
          // Token must be a number
          expect(typeof spacing[tokenName]).toBe('number')
          
          // Token must be positive
          expect(spacing[tokenName]).toBeGreaterThan(0)
          
          // Token must match expected value
          expect(spacing[tokenName]).toBe(expectedValues[tokenName])
        }
      ),
      { numRuns: 100 }
    )
  })

  // Test that typography tokens exist and have valid structure
  test('typography tokens exist with valid font families and sizes', () => {
    // Test font families
    fc.assert(
      fc.property(
        fc.constantFrom('heading', 'body'),
        (fontType) => {
          expect(typography.fontFamily).toHaveProperty(fontType)
          expect(typeof typography.fontFamily[fontType]).toBe('string')
          expect(typography.fontFamily[fontType].length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 100 }
    )

    // Test font sizes
    const requiredFontSizes = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']
    const expectedSizes = { xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 32 }

    fc.assert(
      fc.property(
        fc.constantFrom(...requiredFontSizes),
        (sizeToken) => {
          expect(typography.fontSize).toHaveProperty(sizeToken)
          expect(typeof typography.fontSize[sizeToken]).toBe('number')
          expect(typography.fontSize[sizeToken]).toBeGreaterThan(0)
          expect(typography.fontSize[sizeToken]).toBe(expectedSizes[sizeToken])
        }
      ),
      { numRuns: 100 }
    )
  })

  // Test that shadow configurations exist and have valid structure
  test('shadow configurations exist with valid neon glow properties', () => {
    const requiredShadows = ['neonGlow', 'neonGlowPurple', 'neonGlowAmber']

    fc.assert(
      fc.property(
        fc.constantFrom(...requiredShadows),
        (shadowName) => {
          // Shadow must exist
          expect(shadows).toHaveProperty(shadowName)
          
          const shadow = shadows[shadowName]
          
          // Shadow must have required properties
          expect(shadow).toHaveProperty('shadowColor')
          expect(shadow).toHaveProperty('shadowOffset')
          expect(shadow).toHaveProperty('shadowOpacity')
          expect(shadow).toHaveProperty('shadowRadius')
          expect(shadow).toHaveProperty('elevation')
          
          // shadowColor must be valid hex
          expect(typeof shadow.shadowColor).toBe('string')
          expect(/^#[0-9A-Fa-f]{6}$/.test(shadow.shadowColor)).toBe(true)
          
          // shadowOffset must have width and height
          expect(shadow.shadowOffset).toHaveProperty('width')
          expect(shadow.shadowOffset).toHaveProperty('height')
          expect(typeof shadow.shadowOffset.width).toBe('number')
          expect(typeof shadow.shadowOffset.height).toBe('number')
          
          // shadowOpacity must be between 0 and 1
          expect(typeof shadow.shadowOpacity).toBe('number')
          expect(shadow.shadowOpacity).toBeGreaterThanOrEqual(0)
          expect(shadow.shadowOpacity).toBeLessThanOrEqual(1)
          
          // shadowRadius must be positive
          expect(typeof shadow.shadowRadius).toBe('number')
          expect(shadow.shadowRadius).toBeGreaterThan(0)
          
          // elevation must be a number
          expect(typeof shadow.elevation).toBe('number')
        }
      ),
      { numRuns: 100 }
    )
  })

  // Test that all token categories are exported
  test('all required token categories are exported from the module', () => {
    expect(colors).toBeDefined()
    expect(gradients).toBeDefined()
    expect(spacing).toBeDefined()
    expect(typography).toBeDefined()
    expect(shadows).toBeDefined()
    
    expect(typeof colors).toBe('object')
    expect(typeof gradients).toBe('object')
    expect(typeof spacing).toBe('object')
    expect(typeof typography).toBe('object')
    expect(typeof shadows).toBe('object')
  })
})
