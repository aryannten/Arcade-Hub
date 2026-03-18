import React, { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { storage } from '../utils/storage'
import { soundManager } from '../utils/sounds'
import { colors as designColors, gradients, spacing, typography, shadows } from '../design/tokens'
import GlassCard from '../design/components/GlassCard'
import GradientButton from '../design/components/GradientButton'
import NeonText from '../design/components/NeonText'
import { resolveThemeColors } from '../utils/theme'

export const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

const EMPTY_BOARD = Array(9).fill(null)
const COMPUTER_DELAY_MS = 450
const { width: SCREEN_WIDTH } = Dimensions.get('window')
const BOARD_SIZE = Math.min(SCREEN_WIDTH - spacing.xl * 2, 336)
const CELL_GAP = spacing.sm
const CELL_SIZE = (BOARD_SIZE - CELL_GAP * 2) / 3
const MARK_COLORS = {
  X: designColors.NeonRed,
  O: designColors.NeonCyan,
}

export function checkWinner(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }

  return null
}

export function findWinningLine(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return [a, b, c]
    }
  }

  return []
}

export function getAvailableMoves(board) {
  return board.reduce((moves, cell, index) => {
    if (cell == null) moves.push(index)
    return moves
  }, [])
}

function getOpponent(player) {
  return player === 'X' ? 'O' : 'X'
}

function minimax(board, player, aiPlayer, humanPlayer, depth = 0) {
  const winner = checkWinner(board)

  if (winner === aiPlayer) return { score: 10 - depth }
  if (winner === humanPlayer) return { score: depth - 10 }

  const availableMoves = getAvailableMoves(board)
  if (!availableMoves.length) return { score: 0 }

  const nextResults = availableMoves.map((move) => {
    const nextBoard = [...board]
    nextBoard[move] = player

    return {
      move,
      score: minimax(nextBoard, getOpponent(player), aiPlayer, humanPlayer, depth + 1).score,
    }
  })

  return player === aiPlayer
    ? nextResults.reduce((best, candidate) => (candidate.score > best.score ? candidate : best))
    : nextResults.reduce((best, candidate) => (candidate.score < best.score ? candidate : best))
}

export function chooseComputerMove(board, aiPlayer = 'O', humanPlayer = 'X') {
  const availableMoves = getAvailableMoves(board)
  if (!availableMoves.length) return null

  if (availableMoves.length === board.length) return 4

  return minimax(board, aiPlayer, aiPlayer, humanPlayer).move ?? availableMoves[0]
}

function getRoundStatus({ mode, currentPlayer, winner, isDraw, thinking }) {
  if (winner) {
    if (mode === 'computer') {
      return winner === 'X' ? 'You win the round' : 'Computer wins the round'
    }

    return winner === 'X' ? 'Player X wins the round' : 'Player O wins the round'
  }

  if (isDraw) return 'Round ends in a draw'
  if (thinking) return 'Computer is thinking...'

  if (mode === 'computer') {
    return currentPlayer === 'X' ? 'Your move as X' : 'Computer turn as O'
  }

  return currentPlayer === 'X' ? 'Player X to move' : 'Player O to move'
}

function getScoreLabels(mode) {
  return mode === 'computer'
    ? { x: 'You', o: 'Computer' }
    : { x: 'Player X', o: 'Player O' }
}

export default function TicTacToe({ onBack, colors }) {
  const themeColors = resolveThemeColors(colors)
  const isLight = themeColors.name === 'light'
  const textPrimaryStyle = { color: themeColors.text }
  const textSecondaryStyle = { color: themeColors.textSecondary }
  const heroSurfaceStyle = { backgroundColor: isLight ? 'rgba(255,255,255,0.94)' : '#0B1020' }
  const dividerStyle = { backgroundColor: isLight ? themeColors.border : 'rgba(255, 255, 255, 0.08)' }
  const boardFrameStyle = {
    backgroundColor: isLight ? 'rgba(255,255,255,0.86)' : '#050913',
    borderColor: isLight ? themeColors.border : 'rgba(255, 255, 255, 0.08)',
  }
  const cellSurfaceStyle = {
    borderColor: isLight ? themeColors.border : 'rgba(255, 255, 255, 0.1)',
    backgroundColor: isLight ? 'rgba(240, 249, 255, 0.88)' : 'rgba(255, 255, 255, 0.05)',
  }
  const cellFilledStyle = {
    backgroundColor: isLight ? 'rgba(224, 242, 254, 1)' : 'rgba(255, 255, 255, 0.08)',
  }
  const turnPillStyle = {
    borderColor: isLight ? themeColors.border : 'rgba(255, 255, 255, 0.08)',
    backgroundColor: isLight ? 'rgba(255,255,255,0.78)' : 'rgba(255, 255, 255, 0.04)',
  }
  const turnPillActiveStyle = {
    backgroundColor: isLight ? 'rgba(224,242,254,1)' : 'rgba(255, 255, 255, 0.1)',
  }
  const [mode, setMode] = useState('select')
  const [board, setBoard] = useState([...EMPTY_BOARD])
  const [currentPlayer, setCurrentPlayer] = useState('X')
  const [thinking, setThinking] = useState(false)
  const [xWins, setXWins] = useState(0)
  const [oWins, setOWins] = useState(0)
  const [draws, setDraws] = useState(0)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const winPulseAnim = useRef(new Animated.Value(1)).current
  const roundRecordedRef = useRef(false)

  const winner = checkWinner(board)
  const winningLine = findWinningLine(board)
  const isDraw = !winner && board.every(Boolean)
  const roundOver = Boolean(winner || isDraw)
  const labels = getScoreLabels(mode)
  const status = getRoundStatus({ mode, currentPlayer, winner, isDraw, thinking })

  useEffect(() => {
    fadeAnim.setValue(0)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start()
  }, [fadeAnim, mode])

  useEffect(() => {
    if (!winner) {
      winPulseAnim.setValue(1)
      return
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(winPulseAnim, {
          toValue: 1.08,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(winPulseAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ])
    )

    animation.start()

    return () => {
      winPulseAnim.setValue(1)
    }
  }, [winner, winPulseAnim])

  useEffect(() => {
    if (mode === 'select' || !roundOver || roundRecordedRef.current) return

    roundRecordedRef.current = true

    if (winner === 'X') {
      setXWins((value) => value + 1)
      if (mode === 'computer') {
        soundManager.playSuccess()
        storage.updateGameStats('tictactoe', { gamesPlayed: 1, gamesWon: 1 })
      } else {
        soundManager.playSuccess()
        storage.updateGameStats('tictactoe', { gamesPlayed: 1, gamesWon: 0 })
      }
      return
    }

    if (winner === 'O') {
      setOWins((value) => value + 1)
      if (mode === 'computer') {
        soundManager.playError()
      } else {
        soundManager.playSuccess()
      }
      storage.updateGameStats('tictactoe', { gamesPlayed: 1, gamesWon: 0 })
      return
    }

    setDraws((value) => value + 1)
    soundManager.playClick()
    storage.updateGameStats('tictactoe', { gamesPlayed: 1, gamesWon: 0 })
  }, [mode, roundOver, winner])

  useEffect(() => {
    if (mode !== 'computer' || currentPlayer !== 'O' || roundOver) return

    setThinking(true)

    const timer = setTimeout(() => {
      setBoard((currentBoard) => {
        const move = chooseComputerMove(currentBoard)
        if (move == null || currentBoard[move] != null) return currentBoard

        const nextBoard = [...currentBoard]
        nextBoard[move] = 'O'
        return nextBoard
      })
      setCurrentPlayer('X')
      setThinking(false)
      soundManager.playMove()
    }, COMPUTER_DELAY_MS)

    return () => {
      clearTimeout(timer)
      setThinking(false)
    }
  }, [mode, currentPlayer, roundOver])

  const resetBoard = () => {
    setBoard([...EMPTY_BOARD])
    setCurrentPlayer('X')
    setThinking(false)
    roundRecordedRef.current = false
  }

  const handleNewRound = () => {
    soundManager.playClick()
    resetBoard()
  }

  const handleResetScores = () => {
    soundManager.playClick()
    setXWins(0)
    setOWins(0)
    setDraws(0)
    resetBoard()
  }

  const handleModeSelect = (nextMode) => {
    soundManager.playClick()
    setMode(nextMode)
    setXWins(0)
    setOWins(0)
    setDraws(0)
    resetBoard()
  }

  const handleBackToModes = () => {
    soundManager.playClick()
    setMode('select')
    setXWins(0)
    setOWins(0)
    setDraws(0)
    resetBoard()
  }

  const handleCellPress = (index) => {
    if (board[index] || roundOver || thinking || mode === 'select') return

    soundManager.playMove()
    setBoard((currentBoard) => {
      if (currentBoard[index]) return currentBoard

      const nextBoard = [...currentBoard]
      nextBoard[index] = currentPlayer
      return nextBoard
    })

    setCurrentPlayer((player) => {
      if (mode === 'computer') return 'O'
      return player === 'X' ? 'O' : 'X'
    })
  }

  const renderModePicker = () => {
    return (
      <ScrollView style={[styles.container, { backgroundColor: themeColors.bg }]} contentContainerStyle={styles.content}>
        <Animated.View style={[styles.contentWrap, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={gradients.ticTacToe}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBorder}
          >
            <View style={[styles.heroInner, heroSurfaceStyle]}>
              <View style={styles.heroHeader}>
                <GradientButton
                  gradient={gradients.ticTacToe}
                  label="Back"
                  onPress={onBack}
                  style={styles.backButton}
                />
              </View>

              <NeonText color={designColors.NeonRed} size={30} style={styles.heroTitle}>
                Tic Tac Toe
              </NeonText>
              <Text style={[styles.heroCopy, textPrimaryStyle]}>
                Clean rounds, responsive computer turns, and a board that is readable at a glance.
              </Text>

              <View style={styles.modeStack}>
                <TouchableOpacity testID="mode-computer" onPress={() => handleModeSelect('computer')} activeOpacity={0.9}>
                  <GlassCard style={styles.modeCardPrimary} colors={themeColors}>
                    <Text style={[styles.modeEyebrow, textSecondaryStyle]}>Solo</Text>
                    <Text style={[styles.modeTitle, textPrimaryStyle]}>Play vs Computer</Text>
                    <Text style={[styles.modeDescription, textPrimaryStyle]}>You are X. The computer responds as O with optimal moves.</Text>
                  </GlassCard>
                </TouchableOpacity>

                <TouchableOpacity testID="mode-player" onPress={() => handleModeSelect('player')} activeOpacity={0.9}>
                  <GlassCard style={styles.modeCardSecondary} colors={themeColors}>
                    <Text style={[styles.modeEyebrow, textSecondaryStyle]}>Local</Text>
                    <Text style={[styles.modeTitle, textPrimaryStyle]}>Play vs Friend</Text>
                    <Text style={[styles.modeDescription, textPrimaryStyle]}>Pass-and-play on one device with clear turn and score tracking.</Text>
                  </GlassCard>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    )
  }

  const renderGame = () => {
    return (
      <ScrollView style={[styles.container, { backgroundColor: themeColors.bg }]} contentContainerStyle={styles.gameContent}>
        <Animated.View style={[styles.contentWrap, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={gradients.ticTacToe}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <View style={[styles.headerCard, heroSurfaceStyle]}>
              <GradientButton
                gradient={gradients.ticTacToe}
                label="Modes"
                onPress={handleBackToModes}
                style={styles.backButton}
              />

              <View style={styles.headerCopy}>
                <Text style={[styles.title, textPrimaryStyle]}>Tic Tac Toe</Text>
                <Text style={[styles.headerMode, textSecondaryStyle]}>{mode === 'computer' ? 'Computer Match' : 'Player Match'}</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.controlsRow}>
            <GradientButton
              gradient={gradients.ticTacToe}
              label="New Round"
              onPress={handleNewRound}
              style={styles.actionButton}
            />
            <GradientButton
              gradient={[designColors.NeonAmber, '#7C2D12']}
              label="Reset Scores"
              onPress={handleResetScores}
              style={styles.actionButton}
            />
          </View>

          <GlassCard style={styles.scoreboardCard} colors={themeColors}>
            <View style={styles.scoreBox}>
              <Text style={[styles.scoreLabel, textSecondaryStyle]}>{labels.x}</Text>
              <Text testID="score-x" style={[styles.scoreValue, { color: MARK_COLORS.X }]}>{xWins}</Text>
            </View>
            <View style={[styles.scoreDivider, dividerStyle]} />
            <View style={styles.scoreBox}>
              <Text style={[styles.scoreLabel, textSecondaryStyle]}>Draws</Text>
              <Text testID="score-draws" style={[styles.scoreValue, { color: designColors.NeonAmber }]}>{draws}</Text>
            </View>
            <View style={[styles.scoreDivider, dividerStyle]} />
            <View style={styles.scoreBox}>
              <Text style={[styles.scoreLabel, textSecondaryStyle]}>{labels.o}</Text>
              <Text testID="score-o" style={[styles.scoreValue, { color: MARK_COLORS.O }]}>{oWins}</Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.statusCard} colors={themeColors}>
            <View style={styles.turnRow}>
              <View style={[styles.turnPill, turnPillStyle, currentPlayer === 'X' && !roundOver && styles.turnPillActive, currentPlayer === 'X' && !roundOver && turnPillActiveStyle]}>
                <Text style={[styles.turnLabel, { color: MARK_COLORS.X }]}>X</Text>
              </View>
              <View style={[styles.turnPill, turnPillStyle, currentPlayer === 'O' && !roundOver && styles.turnPillActive, currentPlayer === 'O' && !roundOver && turnPillActiveStyle]}>
                <Text style={[styles.turnLabel, { color: MARK_COLORS.O }]}>O</Text>
              </View>
            </View>
            <NeonText
              color={winner ? MARK_COLORS[winner] : designColors.NeonRed}
              size={20}
              style={styles.statusText}
              testID="status-text"
            >
              {status}
            </NeonText>
            <Text style={[styles.statusHint, textSecondaryStyle]}>
              {mode === 'computer'
                ? 'Tap any open cell to place X. The computer always answers as O.'
                : 'Take turns on the same device. First line of three wins the round.'}
            </Text>
          </GlassCard>

          <View style={styles.boardShell}>
            <View style={[styles.boardFrame, boardFrameStyle]}>
              <View style={styles.board} testID="tic-board">
                {board.map((cell, index) => {
                  const isWinningCell = winningLine.includes(index)

                  return (
                    <TouchableOpacity
                      key={index}
                      testID={`cell-${index}`}
                      activeOpacity={0.88}
                      disabled={Boolean(cell) || roundOver || thinking}
                      onPress={() => handleCellPress(index)}
                      style={[
                        styles.cellTouchable,
                        {
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          marginRight: index % 3 === 2 ? 0 : CELL_GAP,
                          marginBottom: index > 5 ? 0 : CELL_GAP,
                        },
                      ]}
                    >
                      <Animated.View
                        style={[
                          styles.cell,
                          cellSurfaceStyle,
                          cell && styles.cellFilled,
                          cell && cellFilledStyle,
                          isWinningCell && styles.cellWinning,
                          isWinningCell && { transform: [{ scale: winPulseAnim }] },
                        ]}
                      >
                        <Text
                          testID={`cell-mark-${index}`}
                          style={[
                            styles.cellMark,
                            cell ? styles.cellMarkVisible : styles.cellMarkHidden,
                            cell && { color: MARK_COLORS[cell] },
                          ]}
                        >
                          {cell || ' '}
                        </Text>
                      </Animated.View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    )
  }

  return mode === 'select' ? renderModePicker() : renderGame()
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  gameContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  contentWrap: {
    gap: spacing.lg,
  },
  heroBorder: {
    borderRadius: spacing.xl,
    padding: 2,
  },
  heroInner: {
    borderRadius: spacing.xl - 2,
    padding: spacing.xl,
  },
  heroHeader: {
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  heroTitle: {
    textAlign: 'left',
    marginBottom: spacing.sm,
  },
  heroCopy: {
    fontSize: typography.fontSize.md,
    lineHeight: 24,
    marginBottom: spacing.xl,
    fontFamily: typography.fontFamily.body,
  },
  modeStack: {
    gap: spacing.md,
  },
  modeCardPrimary: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  modeCardSecondary: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderColor: 'rgba(56, 189, 248, 0.28)',
    backgroundColor: 'rgba(12, 74, 110, 0.28)',
  },
  modeEyebrow: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modeTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  modeDescription: {
    opacity: 0.88,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  headerGradient: {
    borderRadius: spacing.xl,
    padding: 2,
    marginBottom: spacing.sm,
  },
  headerCard: {
    borderRadius: spacing.xl - 2,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
  },
  headerMode: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    marginTop: 2,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
  },
  backButton: {
    minWidth: 88,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  scoreboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  scoreBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  scoreLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  scoreValue: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
  },
  statusCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  turnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  turnPill: {
    minWidth: 56,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
  },
  turnPillActive: {
  },
  turnLabel: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
  },
  statusText: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  statusHint: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    textAlign: 'center',
    lineHeight: 20,
  },
  boardShell: {
    alignItems: 'center',
  },
  boardFrame: {
    borderRadius: spacing.xl,
    padding: spacing.md,
    borderWidth: 1,
    ...shadows.neonGlow,
  },
  board: {
    width: BOARD_SIZE,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cellTouchable: {
    minWidth: 44,
    minHeight: 44,
  },
  cell: {
    flex: 1,
    borderRadius: spacing.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFilled: {
  },
  cellWinning: {
    borderColor: designColors.NeonAmber,
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
  },
  cellMark: {
    fontSize: 42,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
  },
  cellMarkVisible: {
    opacity: 1,
  },
  cellMarkHidden: {
    opacity: 0,
  },
})
