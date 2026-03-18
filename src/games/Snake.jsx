import React, { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { storage } from '../utils/storage'
import { soundManager } from '../utils/sounds'
import { colors as designColors, gradients, spacing, typography, shadows } from '../design/tokens'
import GlassCard from '../design/components/GlassCard'
import GradientButton from '../design/components/GradientButton'
import NeonText from '../design/components/NeonText'
import { resolveThemeColors } from '../utils/theme'

const foodImage = require('../../assets/games/snake-food.png')

export const GRID = 18
export const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}
export const INITIAL_SNAKE = [{ x: 9, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 9 }]
const INITIAL_FOOD = { x: 14, y: 9 }
const MIN_SPEED = 85
const BASE_SPEED = 145
const SPEED_STEP = 5
const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CELL = Math.floor((SCREEN_WIDTH - spacing.xl * 2 - spacing.md * 2) / GRID)
const BOARD_SIZE = GRID * CELL

function sameCell(a, b) {
  return a.x === b.x && a.y === b.y
}

export function getNextHead(snake, direction) {
  return {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  }
}

export function isOutOfBounds(cell) {
  return cell.x < 0 || cell.x >= GRID || cell.y < 0 || cell.y >= GRID
}

export function isOppositeDirection(currentDirection, nextDirection) {
  return currentDirection.x + nextDirection.x === 0 && currentDirection.y + nextDirection.y === 0
}

export function createFoodPosition(snake, random = Math.random) {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`))
  const freeCells = []

  for (let y = 0; y < GRID; y += 1) {
    for (let x = 0; x < GRID; x += 1) {
      const key = `${x},${y}`
      if (!occupied.has(key)) freeCells.push({ x, y })
    }
  }

  if (!freeCells.length) return null

  const index = Math.min(freeCells.length - 1, Math.floor(random() * freeCells.length))
  return freeCells[index]
}

export function getTickSpeed(score) {
  return Math.max(MIN_SPEED, BASE_SPEED - score * SPEED_STEP)
}

export function getNextSnakeState({ snake, direction, food }) {
  const nextHead = getNextHead(snake, direction)
  const willEat = sameCell(nextHead, food)
  const collisionBody = willEat ? snake : snake.slice(0, -1)
  const hitSelf = collisionBody.some((segment) => sameCell(segment, nextHead))

  if (isOutOfBounds(nextHead)) {
    return { type: 'wall' }
  }

  if (hitSelf) {
    return { type: 'self' }
  }

  const nextSnake = [nextHead, ...snake]
  if (!willEat) nextSnake.pop()

  return {
    type: willEat ? 'eat' : 'move',
    snake: nextSnake,
    head: nextHead,
  }
}

function getStatusText({ started, paused, gameOver, score }) {
  if (gameOver) return 'Run ended'
  if (paused) return 'Game paused'
  if (!started) return 'Press any direction to start'
  return score > 0 ? 'Keep the streak alive' : 'Collect food and avoid the walls'
}

export default function Snake({ onBack, colors }) {
  const themeColors = resolveThemeColors(colors)
  const isLight = themeColors.name === 'light'
  const textPrimaryStyle = { color: themeColors.text }
  const textSecondaryStyle = { color: themeColors.textSecondary }
  const headerSurfaceStyle = { backgroundColor: isLight ? 'rgba(255,255,255,0.94)' : '#071417' }
  const dividerStyle = { backgroundColor: isLight ? themeColors.border : 'rgba(255,255,255,0.08)' }
  const boardContainerStyle = { borderColor: isLight ? themeColors.border : 'rgba(6, 182, 212, 0.35)' }
  const boardSurfaceStyle = { backgroundColor: isLight ? 'rgba(224,242,254,0.7)' : '#061116' }
  const overlayStyle = { backgroundColor: isLight ? 'rgba(240, 249, 255, 0.78)' : 'rgba(3, 8, 12, 0.4)' }
  const controlButtonStyle = {
    borderColor: isLight ? themeColors.border : 'rgba(6, 182, 212, 0.32)',
    backgroundColor: isLight ? 'rgba(6, 182, 212, 0.12)' : 'rgba(6, 182, 212, 0.14)',
  }
  const pauseButtonStyle = {
    borderColor: isLight ? 'rgba(217, 119, 6, 0.28)' : 'rgba(245, 158, 11, 0.35)',
    backgroundColor: isLight ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.14)',
  }
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [food, setFood] = useState(INITIAL_FOOD)
  const [direction, setDirection] = useState(DIRS.right)
  const [started, setStarted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [foodImageError, setFoodImageError] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const foodPulseAnim = useRef(new Animated.Value(1)).current
  const statusAnim = useRef(new Animated.Value(0)).current
  const loopRef = useRef(null)
  const directionRef = useRef(DIRS.right)
  const queuedDirectionRef = useRef(null)
  const gameOverRef = useRef(false)
  const scoreRef = useRef(0)
  const highScoreRef = useRef(0)

  const statusText = getStatusText({ started, paused, gameOver, score })

  useEffect(() => {
    storage.getGameStats('snake').then((stats) => {
      if (stats.bestScore != null) {
        setHighScore(stats.bestScore)
        highScoreRef.current = stats.bestScore
      }
    })

    fadeAnim.setValue(0)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(foodPulseAnim, {
          toValue: 1.18,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(foodPulseAnim, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [fadeAnim, foodPulseAnim])

  useEffect(() => {
    statusAnim.setValue(0)
    Animated.timing(statusAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start()
  }, [statusAnim, started, paused, gameOver, score])

  useEffect(() => {
    scoreRef.current = score
  }, [score])

  const finishGame = () => {
    if (gameOverRef.current) return

    gameOverRef.current = true
    setGameOver(true)
    setPaused(false)
    soundManager.playError()

    const finalScore = scoreRef.current
    if (finalScore > highScoreRef.current) {
      highScoreRef.current = finalScore
      setHighScore(finalScore)
      storage.updateGameStats('snake', { gamesPlayed: 1, bestScore: finalScore })
    } else {
      storage.updateGameStats('snake', { gamesPlayed: 1 })
    }
  }

  const resetGame = () => {
    if (loopRef.current) {
      clearInterval(loopRef.current)
      loopRef.current = null
    }

    const nextFood = createFoodPosition(INITIAL_SNAKE) || INITIAL_FOOD

    setSnake(INITIAL_SNAKE)
    setFood(nextFood)
    setDirection(DIRS.right)
    setStarted(false)
    setPaused(false)
    setGameOver(false)
    setScore(0)
    setFoodImageError(false)
    directionRef.current = DIRS.right
    queuedDirectionRef.current = null
    gameOverRef.current = false
    scoreRef.current = 0
    soundManager.playClick()
  }

  const queueDirection = (nextDirection) => {
    if (gameOver) return

    const current = queuedDirectionRef.current || directionRef.current
    if (isOppositeDirection(current, nextDirection)) return

    queuedDirectionRef.current = nextDirection

    if (!started) {
      setStarted(true)
      setPaused(false)
    }

    if (paused) {
      setPaused(false)
    }

    soundManager.playMove()
  }

  const changeDirection = (directionName) => {
    const nextDirection = DIRS[directionName]
    if (!nextDirection) return
    queueDirection(nextDirection)
  }

  useEffect(() => {
    if (!started || paused || gameOver) {
      if (loopRef.current) {
        clearInterval(loopRef.current)
        loopRef.current = null
      }
      return
    }

    const tick = () => {
      const appliedDirection = queuedDirectionRef.current || directionRef.current
      directionRef.current = appliedDirection
      queuedDirectionRef.current = null
      setDirection(appliedDirection)

      setSnake((currentSnake) => {
        const outcome = getNextSnakeState({
          snake: currentSnake,
          direction: appliedDirection,
          food,
        })

        if (outcome.type === 'wall' || outcome.type === 'self') {
          finishGame()
          return currentSnake
        }

        if (outcome.type === 'eat') {
          const nextScore = scoreRef.current + 1
          scoreRef.current = nextScore
          setScore(nextScore)
          soundManager.playSuccess()

          const nextFood = createFoodPosition(outcome.snake)
          if (nextFood) {
            setFood(nextFood)
          } else {
            finishGame()
          }
        }

        return outcome.snake
      })
    }

    loopRef.current = setInterval(tick, getTickSpeed(score))

    return () => {
      if (loopRef.current) {
        clearInterval(loopRef.current)
        loopRef.current = null
      }
    }
  }, [food, gameOver, paused, score, started])

  const togglePause = () => {
    if (!started || gameOver) return
    setPaused((value) => !value)
    soundManager.playClick()
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.bg }]} contentContainerStyle={styles.content}>
      <Animated.View style={[styles.contentWrap, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={gradients.snake}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={[styles.headerCard, headerSurfaceStyle]}>
            <GradientButton
              gradient={gradients.snake}
              label="Back"
              testID="snake-back"
              onPress={onBack}
              style={styles.backButton}
            />
            <View style={styles.headerCopy}>
              <Text style={[styles.title, textPrimaryStyle]}>Snake</Text>
              <Text style={[styles.headerSubtitle, textSecondaryStyle]}>Cleaner movement, fair food spawns, and a sharper playfield.</Text>
            </View>
            <GradientButton
              gradient={[designColors.NeonAmber, '#7C2D12']}
              label="Reset"
              testID="snake-reset"
              onPress={resetGame}
              style={styles.resetButton}
            />
          </View>
        </LinearGradient>

        <GlassCard style={styles.scoreboardCard} colors={themeColors}>
          <View style={styles.scoreCell}>
            <Text style={[styles.scoreLabel, textSecondaryStyle]}>Score</Text>
            <Text testID="score-current" style={[styles.scoreValue, { color: designColors.NeonCyan }]}>{score}</Text>
          </View>
          <View style={[styles.scoreDivider, dividerStyle]} />
          <View style={styles.scoreCell}>
            <Text style={[styles.scoreLabel, textSecondaryStyle]}>Best</Text>
            <Text testID="score-best" style={[styles.scoreValue, { color: designColors.NeonAmber }]}>{highScore}</Text>
          </View>
          <View style={[styles.scoreDivider, dividerStyle]} />
          <View style={styles.scoreCell}>
            <Text style={[styles.scoreLabel, textSecondaryStyle]}>Speed</Text>
            <Text testID="speed-label" style={[styles.scoreValue, textPrimaryStyle]}>{Math.round((BASE_SPEED - getTickSpeed(score)) / SPEED_STEP) + 1}</Text>
          </View>
        </GlassCard>

        <GlassCard style={styles.statusCard} colors={themeColors}>
          <Animated.View style={{ opacity: statusAnim }}>
            <NeonText
              testID="status-text"
              color={gameOver ? designColors.Danger : paused ? designColors.NeonAmber : designColors.NeonCyan}
              size={22}
              style={styles.statusText}
            >
              {statusText}
            </NeonText>
          </Animated.View>
          <Text style={[styles.statusHint, textSecondaryStyle]}>
            {gameOver
              ? 'Reset to restart the run.'
              : paused
                ? 'Press pause again or choose a direction to resume.'
                : 'The snake accelerates as your score rises. You cannot reverse direction.'}
          </Text>
        </GlassCard>

        <View style={styles.boardShell}>
          <GlassCard style={[styles.boardContainer, boardContainerStyle, shadows.neonGlow]} colors={themeColors}>
            <View style={[styles.board, boardSurfaceStyle, { width: BOARD_SIZE, height: BOARD_SIZE }]} testID="snake-board">
              <Animated.View
                testID="snake-food"
                style={[
                  styles.food,
                  {
                    left: food.x * CELL + 1,
                    top: food.y * CELL + 1,
                    width: CELL - 2,
                    height: CELL - 2,
                    transform: [{ scale: foodPulseAnim }],
                  },
                ]}
              >
                {foodImageError ? (
                  <View style={styles.foodFallback} />
                ) : (
                  <Image
                    source={foodImage}
                    style={styles.foodImage}
                    resizeMode="contain"
                    onError={(error) => {
                      console.warn('Failed to load food image:', error)
                      setFoodImageError(true)
                    }}
                  />
                )}
              </Animated.View>

              {snake.map((segment, index) => (
                <View
                  key={`${segment.x}-${segment.y}-${index}`}
                  testID={index === 0 ? 'snake-head' : undefined}
                  style={[
                    styles.segment,
                    index === 0 ? styles.segmentHead : styles.segmentBody,
                    {
                      left: segment.x * CELL + 1,
                      top: segment.y * CELL + 1,
                      width: CELL - 2,
                      height: CELL - 2,
                    },
                  ]}
                />
              ))}

              {!started && !gameOver && (
                <View style={[styles.overlay, overlayStyle]}>
                  <GlassCard style={styles.overlayCard} colors={themeColors}>
                    <Text style={[styles.overlayTitle, textPrimaryStyle]}>Ready to Slither</Text>
                    <Text style={[styles.overlayText, textSecondaryStyle]}>Press any arrow to start the run.</Text>
                  </GlassCard>
                </View>
              )}

              {gameOver && (
                <View style={[styles.overlay, overlayStyle]}>
                  <GlassCard style={styles.overlayCard} colors={themeColors}>
                    <Text style={[styles.overlayTitle, { color: designColors.Danger }]}>Run Over</Text>
                    <Text style={[styles.overlayText, textSecondaryStyle]}>Score {score}. Reset and try to beat your best.</Text>
                  </GlassCard>
                </View>
              )}
            </View>
          </GlassCard>
        </View>

        <GlassCard style={styles.controlsCard} colors={themeColors}>
          <Text style={[styles.controlsTitle, textPrimaryStyle]}>Controls</Text>
          <View style={styles.controls}>
            <TouchableOpacity
              testID="snake-up"
              activeOpacity={0.88}
              onPress={() => changeDirection('up')}
              disabled={gameOver}
                style={[styles.controlButton, controlButtonStyle, styles.arrowUp, gameOver && styles.controlButtonDisabled]}
              >
              <Text style={[styles.controlLabel, textPrimaryStyle]}>Up</Text>
            </TouchableOpacity>
            <View style={styles.midRow}>
              <TouchableOpacity
                testID="snake-left"
                activeOpacity={0.88}
                onPress={() => changeDirection('left')}
                disabled={gameOver}
                style={[styles.controlButton, controlButtonStyle, styles.arrowSide, gameOver && styles.controlButtonDisabled]}
              >
                <Text style={[styles.controlLabel, textPrimaryStyle]}>Left</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="snake-pause"
                activeOpacity={0.88}
                onPress={togglePause}
                disabled={!started || gameOver}
                style={[
                  styles.controlButton,
                  controlButtonStyle,
                  styles.pauseButton,
                  pauseButtonStyle,
                  styles.pauseControl,
                  (!started || gameOver) && styles.controlButtonDisabled,
                ]}
              >
                <Text style={[styles.controlLabel, textPrimaryStyle]}>{paused ? 'Resume' : 'Pause'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="snake-right"
                activeOpacity={0.88}
                onPress={() => changeDirection('right')}
                disabled={gameOver}
                style={[styles.controlButton, controlButtonStyle, styles.arrowSide, gameOver && styles.controlButtonDisabled]}
              >
                <Text style={[styles.controlLabel, textPrimaryStyle]}>Right</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              testID="snake-down"
              activeOpacity={0.88}
              onPress={() => changeDirection('down')}
              disabled={gameOver}
              style={[styles.controlButton, controlButtonStyle, styles.arrowUp, gameOver && styles.controlButtonDisabled]}
            >
              <Text style={[styles.controlLabel, textPrimaryStyle]}>Down</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </Animated.View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  contentWrap: {
    gap: spacing.md,
  },
  headerGradient: {
    borderRadius: spacing.xl,
    padding: 2,
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
  backButton: {
    minWidth: 84,
  },
  resetButton: {
    minWidth: 84,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    marginTop: 2,
  },
  scoreboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  scoreCell: {
    flex: 1,
    alignItems: 'center',
  },
  scoreDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.08)',
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
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  statusText: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  statusHint: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    lineHeight: 20,
    textAlign: 'center',
  },
  boardShell: {
    alignItems: 'center',
  },
  boardContainer: {
    padding: spacing.md,
    borderWidth: 1,
  },
  board: {
    position: 'relative',
    borderRadius: spacing.lg,
    overflow: 'hidden',
  },
  food: {
    position: 'absolute',
    borderRadius: 6,
    zIndex: 2,
    ...shadows.neonGlow,
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  foodFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    backgroundColor: designColors.NeonRed,
  },
  segment: {
    position: 'absolute',
    borderRadius: 6,
    zIndex: 3,
  },
  segmentHead: {
    backgroundColor: gradients.snake[0],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    ...shadows.neonGlow,
  },
  segmentBody: {
    backgroundColor: gradients.snake[1],
    opacity: 0.9,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  overlayCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  overlayTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  overlayText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    textAlign: 'center',
    lineHeight: 20,
  },
  controlsCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  controlsTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  controls: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  midRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  arrowUp: {
    minWidth: 92,
  },
  arrowSide: {
    minWidth: 92,
  },
  pauseButton: {
    minWidth: 108,
  },
  controlButton: {
    minHeight: 48,
    borderRadius: spacing.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pauseControl: {
  },
  controlButtonDisabled: {
    opacity: 0.45,
  },
  controlLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
  },
})
