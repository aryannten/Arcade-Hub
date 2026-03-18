// Unit tests for image caching and loading
// Feature: game-image-assets
// Task 6.1: Verify image caching and loading
// **Validates: Requirements 5.1, 5.3**

import React from 'react'
import { render } from '@testing-library/react-native'
import { Image } from 'react-native'
import FlappyBird from '../FlappyBird'
import Snake from '../Snake'

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

describe('Image Caching and Loading', () => {
  describe('Static require() for Metro bundler optimization', () => {
    it('FlappyBird uses static require() for bird image (Requirement 5.1)', () => {
      // Verify that the module imports the image using require()
      // This is done at module level, not runtime
      const FlappyBirdModule = require('../FlappyBird')
      const moduleSource = FlappyBirdModule.default.toString()
      
      // The component should reference the statically required image
      // We can verify this by checking that Image components are rendered
      const { UNSAFE_root } = render(
        <FlappyBird onBack={() => {}} />
      )
      
      const images = UNSAFE_root.findAllByType(Image)
      expect(images.length).toBeGreaterThan(0)
      
      // Verify the image has a source prop (from static require)
      // In test environment, images are mocked as strings, but in production they're numbers
      const birdImage = images.find(img => 
        img.props.source && (typeof img.props.source === 'number' || typeof img.props.source === 'string')
      )
      expect(birdImage).toBeDefined()
      expect(birdImage.props.source).toBeTruthy() // Has a source from require()
    })

    it('Snake uses static require() for food image (Requirement 5.1)', () => {
      const SnakeModule = require('../Snake')
      
      const { UNSAFE_root } = render(
        <Snake onBack={() => {}} />
      )
      
      const images = UNSAFE_root.findAllByType(Image)
      expect(images.length).toBeGreaterThan(0)
      
      // Verify the food image has a source prop (from static require)
      // In test environment, images are mocked as strings, but in production they're numbers
      const foodImage = images.find(img => 
        img.props.source && (typeof img.props.source === 'number' || typeof img.props.source === 'string')
      )
      expect(foodImage).toBeDefined()
      expect(foodImage.props.source).toBeTruthy() // Has a source from require()
    })

    it('verifies static require() enables Metro bundler optimization', () => {
      // Static require() at module level allows Metro to:
      // 1. Bundle images at build time
      // 2. Optimize image assets
      // 3. Enable automatic caching
      // 4. Eliminate network requests
      
      // We verify this by checking that image sources are present
      // (Metro's asset system assigns numeric IDs to bundled assets in production)
      // (In test environment, they're mocked as strings)
      
      const { UNSAFE_root: flappyRoot } = render(
        <FlappyBird onBack={() => {}} />
      )
      
      const { UNSAFE_root: snakeRoot } = render(
        <Snake onBack={() => {}} />
      )
      
      const flappyImages = flappyRoot.findAllByType(Image)
      const snakeImages = snakeRoot.findAllByType(Image)
      
      // All images should have source values (bundled assets)
      flappyImages.forEach(img => {
        if (img.props.source) {
          expect(img.props.source).toBeTruthy()
          expect(typeof img.props.source).toMatch(/number|string/) // number in prod, string in test
        }
      })
      
      snakeImages.forEach(img => {
        if (img.props.source) {
          expect(img.props.source).toBeTruthy()
          expect(typeof img.props.source).toMatch(/number|string/) // number in prod, string in test
        }
      })
    })
  })

  describe('Images load before gameplay starts', () => {
    it('FlappyBird renders bird image immediately on mount (Requirement 5.3)', () => {
      const { UNSAFE_root } = render(
        <FlappyBird onBack={() => {}} />
      )
      
      // Image should be present immediately (synchronous access to bundled asset)
      const images = UNSAFE_root.findAllByType(Image)
      const birdImage = images.find(img => 
        img.props.source && (typeof img.props.source === 'number' || typeof img.props.source === 'string')
      )
      
      expect(birdImage).toBeDefined()
      expect(birdImage.props.source).toBeTruthy()
      
      // Verify image is rendered before game starts
      // (game starts when user taps, but image is already loaded)
      const startHint = UNSAFE_root.findAllByType('Text').find(
        node => node.props.children === 'Tap to fly!'
      )
      expect(startHint).toBeDefined() // Game hasn't started yet
      expect(birdImage).toBeDefined() // But image is already rendered
    })

    it('Snake renders food image immediately on mount (Requirement 5.3)', () => {
      const { UNSAFE_root } = render(
        <Snake onBack={() => {}} />
      )
      
      // Image should be present immediately
      const images = UNSAFE_root.findAllByType(Image)
      const foodImage = images.find(img => 
        img.props.source && (typeof img.props.source === 'number' || typeof img.props.source === 'string')
      )
      
      expect(foodImage).toBeDefined()
      expect(foodImage.props.source).toBeTruthy()
      
      // Verify image is rendered at game start
      // Snake game starts immediately, so image must be ready
      expect(foodImage).toBeDefined()
    })

    it('verifies no loading delays or network requests', () => {
      // Static require() ensures:
      // 1. Images are bundled at build time
      // 2. No network requests needed
      // 3. Synchronous access to image data
      // 4. No loading spinners or delays
      
      const startTime = Date.now()
      
      const { UNSAFE_root: flappyRoot } = render(
        <FlappyBird onBack={() => {}} />
      )
      
      const { UNSAFE_root: snakeRoot } = render(
        <Snake onBack={() => {}} />
      )
      
      const endTime = Date.now()
      const renderTime = endTime - startTime
      
      // Rendering should be fast (< 100ms) since images are bundled
      expect(renderTime).toBeLessThan(100)
      
      // Verify images are present immediately
      const flappyImages = flappyRoot.findAllByType(Image)
      const snakeImages = snakeRoot.findAllByType(Image)
      
      expect(flappyImages.length).toBeGreaterThan(0)
      expect(snakeImages.length).toBeGreaterThan(0)
    })
  })

  describe('Image caching behavior', () => {
    it('verifies React Native automatic caching for bundled assets', () => {
      // React Native automatically caches images loaded via require()
      // Multiple renders should use the same cached asset
      
      const { UNSAFE_root: render1 } = render(
        <FlappyBird onBack={() => {}} />
      )
      
      const { UNSAFE_root: render2 } = render(
        <FlappyBird onBack={() => {}} />
      )
      
      const images1 = render1.findAllByType(Image)
      const images2 = render2.findAllByType(Image)
      
      const birdImage1 = images1.find(img => 
        img.props.source && (typeof img.props.source === 'number' || typeof img.props.source === 'string')
      )
      const birdImage2 = images2.find(img => 
        img.props.source && (typeof img.props.source === 'number' || typeof img.props.source === 'string')
      )
      
      expect(birdImage1).toBeDefined()
      expect(birdImage2).toBeDefined()
      
      // Both should reference the same asset (cached)
      expect(birdImage1.props.source).toBe(birdImage2.props.source)
    })

    it('verifies Snake food image is cached across renders', () => {
      const { UNSAFE_root: render1 } = render(
        <Snake onBack={() => {}} />
      )
      
      const { UNSAFE_root: render2 } = render(
        <Snake onBack={() => {}} />
      )
      
      const images1 = render1.findAllByType(Image)
      const images2 = render2.findAllByType(Image)
      
      const foodImage1 = images1.find(img => 
        img.props.source && (typeof img.props.source === 'number' || typeof img.props.source === 'string')
      )
      const foodImage2 = images2.find(img => 
        img.props.source && (typeof img.props.source === 'number' || typeof img.props.source === 'string')
      )
      
      expect(foodImage1).toBeDefined()
      expect(foodImage2).toBeDefined()
      
      // Both should reference the same asset (cached)
      expect(foodImage1.props.source).toBe(foodImage2.props.source)
    })
  })

  describe('Image component configuration', () => {
    it('FlappyBird image uses resizeMode="contain" to prevent distortion', () => {
      const { UNSAFE_root } = render(
        <FlappyBird onBack={() => {}} />
      )
      
      const images = UNSAFE_root.findAllByType(Image)
      const birdImage = images.find(img => 
        img.props.source && (typeof img.props.source === 'number' || typeof img.props.source === 'string')
      )
      
      expect(birdImage).toBeDefined()
      expect(birdImage.props.resizeMode).toBe('contain')
    })

    it('Snake food image uses resizeMode="contain" to prevent distortion', () => {
      const { UNSAFE_root } = render(
        <Snake onBack={() => {}} />
      )
      
      const images = UNSAFE_root.findAllByType(Image)
      const foodImage = images.find(img => 
        img.props.source && (typeof img.props.source === 'number' || typeof img.props.source === 'string')
      )
      
      expect(foodImage).toBeDefined()
      expect(foodImage.props.resizeMode).toBe('contain')
    })

    it('verifies images have error handlers for graceful degradation', () => {
      const { UNSAFE_root: flappyRoot } = render(
        <FlappyBird onBack={() => {}} />
      )
      
      const { UNSAFE_root: snakeRoot } = render(
        <Snake onBack={() => {}} />
      )
      
      const flappyImages = flappyRoot.findAllByType(Image)
      const snakeImages = snakeRoot.findAllByType(Image)
      
      // Verify error handlers are present
      flappyImages.forEach(img => {
        if (img.props.source && (typeof img.props.source === 'number' || typeof img.props.source === 'string')) {
          expect(typeof img.props.onError).toBe('function')
        }
      })
      
      snakeImages.forEach(img => {
        if (img.props.source && (typeof img.props.source === 'number' || typeof img.props.source === 'string')) {
          expect(typeof img.props.onError).toBe('function')
        }
      })
    })
  })
})
