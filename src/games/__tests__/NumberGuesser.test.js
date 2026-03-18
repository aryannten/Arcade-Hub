import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import NumberGuesser from '../NumberGuesser'

jest.mock('../../utils/storage', () => ({
  storage: {
    updateGameStats: jest.fn().mockResolvedValue({}),
  },
}))

describe('NumberGuesser', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders the redesigned layout and difficulty controls', () => {
    const { getByText, getByPlaceholderText } = render(<NumberGuesser onBack={jest.fn()} />)

    expect(getByText('Number Guesser')).toBeTruthy()
    expect(getByText('Current Range')).toBeTruthy()
    expect(getByText('Difficulty')).toBeTruthy()
    expect(getByText('Easy · 1 to 10')).toBeTruthy()
    expect(getByText('Medium · 1 to 50')).toBeTruthy()
    expect(getByText('Hard · 1 to 100')).toBeTruthy()
    expect(getByPlaceholderText('Type your guess')).toBeTruthy()
  })

  it('updates feedback and history after a guess', () => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0.49)

    const { getByPlaceholderText, getByText, getAllByText } = render(<NumberGuesser onBack={jest.fn()} />)

    const input = getByPlaceholderText('Type your guess')
    fireEvent.changeText(input, '25')
    fireEvent.press(getByText('Submit Guess'))

    expect(getByText('Go Higher')).toBeTruthy()
    expect(getByText('Attempt 1')).toBeTruthy()
    expect(getAllByText('25').length).toBeGreaterThan(0)
  })
})
