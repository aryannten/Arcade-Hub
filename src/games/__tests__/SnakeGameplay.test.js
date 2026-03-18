import React from 'react'
import { act, fireEvent, render } from '@testing-library/react-native'
import Snake, {
  DIRS,
  GRID,
  createFoodPosition,
  getNextHead,
  getNextSnakeState,
  getTickSpeed,
  isOppositeDirection,
} from '../Snake'

jest.mock('../../utils/storage', () => ({
  storage: {
    getGameStats: jest.fn().mockResolvedValue({ bestScore: 0 }),
    updateGameStats: jest.fn().mockResolvedValue({}),
  },
}))

jest.mock('../../utils/sounds', () => ({
  soundManager: {
    playClick: jest.fn(),
    playError: jest.fn(),
    playMove: jest.fn(),
    playSuccess: jest.fn(),
  },
}))

describe('Snake helpers', () => {
  it('computes the next head from the current direction', () => {
    expect(getNextHead([{ x: 3, y: 4 }], DIRS.right)).toEqual({ x: 4, y: 4 })
    expect(getNextHead([{ x: 3, y: 4 }], DIRS.up)).toEqual({ x: 3, y: 3 })
  })

  it('rejects opposite directions', () => {
    expect(isOppositeDirection(DIRS.left, DIRS.right)).toBe(true)
    expect(isOppositeDirection(DIRS.up, DIRS.right)).toBe(false)
  })

  it('spawns food only on free cells', () => {
    const snake = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]
    const food = createFoodPosition(snake, () => 0)

    expect(food).toEqual({ x: 3, y: 0 })
  })

  it('returns an eat outcome when the snake reaches food', () => {
    const snake = [{ x: 3, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 4 }]
    const outcome = getNextSnakeState({
      snake,
      direction: DIRS.right,
      food: { x: 4, y: 4 },
    })

    expect(outcome.type).toBe('eat')
    expect(outcome.snake).toHaveLength(4)
  })

  it('detects wall and self collisions', () => {
    expect(
      getNextSnakeState({
        snake: [{ x: GRID - 1, y: 0 }],
        direction: DIRS.right,
        food: { x: 4, y: 4 },
      }).type
    ).toBe('wall')

    expect(
      getNextSnakeState({
        snake: [
          { x: 3, y: 3 },
          { x: 3, y: 4 },
          { x: 2, y: 4 },
          { x: 2, y: 3 },
        ],
        direction: DIRS.down,
        food: { x: 7, y: 7 },
      }).type
    ).toBe('self')
  })

  it('increases speed as score rises but clamps at a minimum', () => {
    expect(getTickSpeed(0)).toBeGreaterThan(getTickSpeed(5))
    expect(getTickSpeed(100)).toBe(getTickSpeed(1000))
  })
})

describe('Snake component', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
  })

  it('shows the initial ready state and starts on direction input', () => {
    const { getByTestId } = render(<Snake onBack={jest.fn()} />)

    expect(getByTestId('status-text')).toHaveTextContent('Press any direction to start')

    fireEvent.press(getByTestId('snake-right'))

    expect(getByTestId('status-text')).toHaveTextContent('Collect food and avoid the walls')
  })

  it('can pause and then reset after a run ends', async () => {
    const { getByTestId } = render(<Snake onBack={jest.fn()} />)

    fireEvent.press(getByTestId('snake-right'))
    fireEvent.press(getByTestId('snake-pause'))
    expect(getByTestId('status-text')).toHaveTextContent('Game paused')

    fireEvent.press(getByTestId('snake-right'))
    expect(getByTestId('status-text')).toHaveTextContent('Collect food and avoid the walls')

    act(() => {
      jest.advanceTimersByTime(1500)
    })

    expect(getByTestId('status-text')).toHaveTextContent('Run ended')

    fireEvent.press(getByTestId('snake-reset'))

    expect(getByTestId('status-text')).toHaveTextContent('Press any direction to start')
    expect(getByTestId('score-current')).toHaveTextContent('0')
  })
})
