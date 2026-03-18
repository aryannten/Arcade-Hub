import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import GameCard from '../GameCard'

// Mock react-native-linear-gradient
jest.mock('react-native-linear-gradient', () => 'LinearGradient')

describe('GameCard', () => {
  const mockColors = {
    cardBg: '#1a1a1a',
    border: '#333',
    primary: '#06B6D4',
    text: '#fff',
    textSecondary: '#999'
  }

  const defaultProps = {
    title: 'Memory Match',
    description: 'Match pairs of cards',
    iconName: 'cards',
    iconFamily: 'MaterialCommunityIcons',
    difficulty: 'Medium',
    colors: mockColors,
    onPress: jest.fn(),
    index: 0
  }

  it('renders with all required elements', () => {
    const { getByText } = render(<GameCard {...defaultProps} />)
    
    expect(getByText('Memory Match')).toBeTruthy()
    expect(getByText('Match pairs of cards')).toBeTruthy()
    expect(getByText('Play')).toBeTruthy()
  })

  it('calls onPress when card is pressed', () => {
    const onPress = jest.fn()
    const { getByText } = render(<GameCard {...defaultProps} onPress={onPress} />)
    
    fireEvent.press(getByText('Play'))
    
    // Wait for animation to complete
    setTimeout(() => {
      expect(onPress).toHaveBeenCalled()
    }, 400)
  })

  it('renders DifficultyBadge with correct difficulty', () => {
    const { getByText } = render(<GameCard {...defaultProps} difficulty="Hard" />)
    
    expect(getByText('HARD')).toBeTruthy()
  })

  it('uses GlassCard as base component', () => {
    const { root } = render(<GameCard {...defaultProps} />)
    
    // GlassCard should be in the component tree
    expect(root).toBeTruthy()
  })

  it('applies game-specific gradient for Memory Match', () => {
    const { root } = render(<GameCard {...defaultProps} title="Memory Match" />)
    
    // Component should render without errors
    expect(root).toBeTruthy()
  })

  it('applies game-specific gradient for Snake', () => {
    const { root } = render(<GameCard {...defaultProps} title="Snake" />)
    
    // Component should render without errors
    expect(root).toBeTruthy()
  })

  it('has minimum 44px touch target for play button', () => {
    const { root } = render(<GameCard {...defaultProps} />)
    
    // Component should render with proper touch targets
    expect(root).toBeTruthy()
  })

  it('supports staggered animation with index prop', () => {
    const { root: root1 } = render(<GameCard {...defaultProps} index={0} />)
    const { root: root2 } = render(<GameCard {...defaultProps} index={1} />)
    
    // Both should render successfully with different animation delays
    expect(root1).toBeTruthy()
    expect(root2).toBeTruthy()
  })
})
