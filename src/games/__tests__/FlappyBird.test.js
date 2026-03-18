import React from 'react'
import { render } from '@testing-library/react-native'
import FlappyBird from '../FlappyBird'

// Mock dependencies
jest.mock('../../utils/storage', () => ({
  storage: {
    getGameStats: jest.fn().mockResolvedValue({ bestScore: 0 }),
    updateGameStats: jest.fn().mockResolvedValue({})
  }
}))

jest.mock('../../utils/sounds', () => ({
  soundManager: {
    playMove: jest.fn(),
    playSuccess: jest.fn(),
    playError: jest.fn(),
    playClick: jest.fn()
  }
}))

describe('FlappyBird', () => {
  const mockOnBack = jest.fn()
  const mockColors = {
    bg: '#000',
    text: '#fff',
    cardBg: '#111',
    border: '#333',
    error: '#f00',
    textSecondary: '#999'
  }

  it('renders without crashing', () => {
    const { getByText } = render(
      <FlappyBird onBack={mockOnBack} colors={mockColors} />
    )
    
    expect(getByText('Flappy Bird')).toBeTruthy()
    expect(getByText('← Back')).toBeTruthy()
    expect(getByText('Reset')).toBeTruthy()
  })

  it('displays score and best score using StatBar', () => {
    const { getByText } = render(
      <FlappyBird onBack={mockOnBack} colors={mockColors} />
    )
    
    expect(getByText('Score')).toBeTruthy()
    expect(getByText('Best')).toBeTruthy()
  })

  it('displays start hint when game not started', () => {
    const { getByText } = render(
      <FlappyBird onBack={mockOnBack} colors={mockColors} />
    )
    
    expect(getByText('Tap to fly!')).toBeTruthy()
  })

  it('uses design system components', () => {
    const { UNSAFE_root } = render(
      <FlappyBird onBack={mockOnBack} colors={mockColors} />
    )
    
    // Verify GlassCard is used (check for glassmorphism styling)
    const glassCards = UNSAFE_root.findAllByType('View').filter(
      node => node.props.style && 
      Array.isArray(node.props.style) &&
      node.props.style.some(s => s && s.backgroundColor === 'rgba(255, 255, 255, 0.05)')
    )
    expect(glassCards.length).toBeGreaterThan(0)
  })
})
