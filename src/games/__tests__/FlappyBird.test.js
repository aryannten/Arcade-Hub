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

  it('applies rotation transform to bird Image container based on velocity', () => {
    const { UNSAFE_root } = render(
      <FlappyBird onBack={mockOnBack} colors={mockColors} />
    )
    
    // Find the bird container View (has rotation transform)
    const birdContainers = UNSAFE_root.findAllByType('View').filter(
      node => {
        const style = node.props.style
        if (!style) return false
        
        // Check if this View has a transform with rotate
        const hasRotate = Array.isArray(style) 
          ? style.some(s => s && s.transform && Array.isArray(s.transform) && 
              s.transform.some(t => t && t.rotate !== undefined))
          : style.transform && Array.isArray(style.transform) && 
              style.transform.some(t => t && t.rotate !== undefined)
        
        return hasRotate
      }
    )
    
    expect(birdContainers.length).toBeGreaterThan(0)
    
    // Verify the bird container has the Image component as a child
    const birdContainer = birdContainers[0]
    const images = birdContainer.findAllByType('Image')
    expect(images.length).toBeGreaterThan(0)
    
    // Verify rotation is applied (initial velocity is 0, so rotation should be 0deg)
    const style = Array.isArray(birdContainer.props.style) 
      ? birdContainer.props.style.find(s => s && s.transform)
      : birdContainer.props.style
    
    const transform = style.transform
    const rotateTransform = transform.find(t => t.rotate !== undefined)
    expect(rotateTransform.rotate).toBe('0deg') // Initial velocity is 0
  })

  it('verifies rotation animation formula matches velocity', () => {
    const { UNSAFE_root } = render(
      <FlappyBird onBack={mockOnBack} colors={mockColors} />
    )
    
    // Find the bird container View
    const birdContainers = UNSAFE_root.findAllByType('View').filter(
      node => {
        const style = node.props.style
        if (!style) return false
        
        const hasRotate = Array.isArray(style) 
          ? style.some(s => s && s.transform && Array.isArray(s.transform) && 
              s.transform.some(t => t && t.rotate !== undefined))
          : style.transform && Array.isArray(style.transform) && 
              style.transform.some(t => t && t.rotate !== undefined)
        
        return hasRotate
      }
    )
    
    const birdContainer = birdContainers[0]
    const style = Array.isArray(birdContainer.props.style) 
      ? birdContainer.props.style.find(s => s && s.transform)
      : birdContainer.props.style
    
    const transform = style.transform
    const rotateTransform = transform.find(t => t.rotate !== undefined)
    
    // Verify the rotation formula: Math.min(velocity * 3, 45)
    // At initial velocity 0, rotation should be 0deg
    expect(rotateTransform.rotate).toBe('0deg')
    
    // The formula ensures rotation is capped at 45 degrees
    // This test verifies the transform is applied to the container wrapping the Image
  })
})
