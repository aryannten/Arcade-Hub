import React from 'react'
import { act, fireEvent, render } from '@testing-library/react-native'
import RockPaperScissors, { getRoundMessage, getRoundOutcome, resolveRound } from '../RockPaperScissors'

jest.mock('../../utils/storage', () => ({
  storage: {
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

describe('RockPaperScissors helpers', () => {
  it('detects player wins, losses, and ties', () => {
    expect(getRoundOutcome('rock', 'scissors')).toBe('win')
    expect(getRoundOutcome('rock', 'paper')).toBe('loss')
    expect(getRoundOutcome('rock', 'rock')).toBe('tie')
  })

  it('resolves a round into message and mapped choices', () => {
    const round = resolveRound('paper', 'rock')

    expect(round.result).toBe('win')
    expect(round.message).toBe(getRoundMessage('win'))
    expect(round.playerChoice.name).toBe('paper')
    expect(round.computerChoice.name).toBe('rock')
  })
})

describe('RockPaperScissors component', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('renders the title and default status', () => {
    const { getByText, getByTestId } = render(<RockPaperScissors onBack={jest.fn()} />)

    expect(getByText('Rock Paper Scissors')).toBeTruthy()
    expect(getByTestId('status-text')).toHaveTextContent('Choose your move')
  })

  it('plays a winning round and updates scores and history', () => {
    jest.spyOn(global.Math, 'random').mockReturnValue(2 / 3)

    const { getByTestId, getByText } = render(<RockPaperScissors onBack={jest.fn()} />)

    fireEvent.press(getByTestId('choice-rock'))

    expect(getByTestId('status-text')).toHaveTextContent('Computer is choosing...')

    act(() => {
      jest.advanceTimersByTime(600)
    })

    expect(getByTestId('status-text')).toHaveTextContent('You take the round')
    expect(getByTestId('score-player')).toHaveTextContent('1')
    expect(getByTestId('streak-current')).toHaveTextContent('1')
    expect(getByTestId('streak-best')).toHaveTextContent('1')
    expect(getByTestId('round-count')).toHaveTextContent('1')
    expect(getByTestId('player-choice')).toHaveTextContent('🪨')
    expect(getByTestId('computer-choice')).toHaveTextContent('✂️')
    expect(getByText('You won')).toBeTruthy()
  })

  it('resets the running match state', () => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0)

    const { getByTestId, getByText } = render(<RockPaperScissors onBack={jest.fn()} />)

    fireEvent.press(getByTestId('choice-paper'))

    act(() => {
      jest.advanceTimersByTime(600)
    })

    expect(getByTestId('score-player')).not.toHaveTextContent('0')

    fireEvent.press(getByText('Reset'))

    expect(getByTestId('score-player')).toHaveTextContent('0')
    expect(getByTestId('score-computer')).toHaveTextContent('0')
    expect(getByTestId('score-ties')).toHaveTextContent('0')
    expect(getByTestId('round-count')).toHaveTextContent('0')
    expect(getByTestId('status-text')).toHaveTextContent('Choose your move')
    expect(getByText('No rounds yet. Throw a move to start the match.')).toBeTruthy()
  })
})
