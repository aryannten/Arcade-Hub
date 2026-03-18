import {
  BIRD_HITBOX_INSET,
  BIRD_SIZE,
  BIRD_X,
  PIPE_GAP,
  PIPE_WIDTH,
  getBirdBounds,
  hasPassedPipe,
  hasPipeCollision,
} from '../FlappyBird'

describe('FlappyBird physics', () => {
  it('shrinks the bird hitbox to the visible body', () => {
    const bounds = getBirdBounds(BIRD_X, 100)

    expect(bounds.left).toBe(BIRD_X + BIRD_HITBOX_INSET)
    expect(bounds.right).toBe(BIRD_X + BIRD_SIZE - BIRD_HITBOX_INSET)
    expect(bounds.top).toBe(100 + BIRD_HITBOX_INSET)
    expect(bounds.bottom).toBe(100 + BIRD_SIZE - BIRD_HITBOX_INSET)
  })

  it('does not collide when the bird is cleanly inside the pipe gap', () => {
    const pipe = { x: BIRD_X - PIPE_WIDTH / 2, topHeight: 120 }
    const birdY = pipe.topHeight + (PIPE_GAP - BIRD_SIZE) / 2

    expect(hasPipeCollision({ pipe, birdX: BIRD_X, birdY })).toBe(false)
  })

  it('collides when the bird clips the lower pipe edge', () => {
    const pipe = { x: BIRD_X - PIPE_WIDTH / 2, topHeight: 120 }
    const birdY = pipe.topHeight + PIPE_GAP - (BIRD_SIZE - BIRD_HITBOX_INSET) + 1

    expect(hasPipeCollision({ pipe, birdX: BIRD_X, birdY })).toBe(true)
  })

  it('detects a swept collision when the pipe crosses the bird between ticks', () => {
    const pipe = { x: BIRD_X - PIPE_WIDTH - 2, topHeight: 100 }
    const previousPipeX = BIRD_X + BIRD_SIZE + 2

    expect(
      hasPipeCollision({
        pipe,
        birdX: BIRD_X,
        birdY: 90,
        previousBirdY: 90,
        previousPipeX,
      })
    ).toBe(true)
  })

  it('only scores a pipe after the bird has fully cleared it', () => {
    const birdBounds = getBirdBounds(BIRD_X, 160)

    expect(hasPassedPipe(birdBounds.left - PIPE_WIDTH + 1, birdBounds)).toBe(false)
    expect(hasPassedPipe(birdBounds.left - PIPE_WIDTH - 1, birdBounds)).toBe(true)
  })
})
