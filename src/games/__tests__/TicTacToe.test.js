import React from 'react'
import { act, fireEvent, render } from '@testing-library/react-native'
import TicTacToe, { checkWinner, chooseComputerMove, findWinningLine } from '../TicTacToe'

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

describe('TicTacToe helpers', () => {
  it('finds a winner and winning line', () => {
    const board = ['X', 'X', 'X', null, 'O', null, 'O', null, null]

    expect(checkWinner(board)).toBe('X')
    expect(findWinningLine(board)).toEqual([0, 1, 2])
  })

  it('makes the computer take an immediate winning move', () => {
    const board = ['O', 'O', null, 'X', 'X', null, null, null, null]

    expect(chooseComputerMove(board)).toBe(2)
  })

  it('makes the computer block an immediate loss', () => {
    const board = ['X', 'X', null, null, 'O', null, null, null, null]

    expect(chooseComputerMove(board)).toBe(2)
  })

  it('opens by taking the center square', () => {
    const board = Array(9).fill(null)

    expect(chooseComputerMove(board)).toBe(4)
  })
})

describe('TicTacToe component', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('renders the mode picker and starts a computer game', () => {
    const { getByTestId, getByText } = render(<TicTacToe onBack={jest.fn()} />)

    expect(getByText('Tic Tac Toe')).toBeTruthy()

    fireEvent.press(getByTestId('mode-computer'))

    expect(getByText('Computer Match')).toBeTruthy()
    expect(getByText('Your move as X')).toBeTruthy()
  })

  it('lets the computer answer after the player move', () => {
    const { getByTestId, getByText } = render(<TicTacToe onBack={jest.fn()} />)

    fireEvent.press(getByTestId('mode-computer'))
    fireEvent.press(getByTestId('cell-0'))

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(getByTestId('cell-mark-0')).toHaveTextContent('X')
    expect(getByTestId('cell-mark-4')).toHaveTextContent('O')
    expect(getByText('Your move as X')).toBeTruthy()
  })

  it('tracks a player-mode win on the scoreboard', () => {
    const { getByTestId, getByText } = render(<TicTacToe onBack={jest.fn()} />)

    fireEvent.press(getByTestId('mode-player'))
    fireEvent.press(getByTestId('cell-0'))
    fireEvent.press(getByTestId('cell-3'))
    fireEvent.press(getByTestId('cell-1'))
    fireEvent.press(getByTestId('cell-4'))
    fireEvent.press(getByTestId('cell-2'))

    expect(getByText('Player X wins the round')).toBeTruthy()
    expect(getByTestId('score-x')).toHaveTextContent('1')
  })
})
