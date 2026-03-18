import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { storage } from '../utils/storage'
import { soundManager } from '../utils/sounds'
import { colors, gradients, spacing, typography } from '../design/tokens'
import GlassCard from '../design/components/GlassCard'
import StatBar from '../design/components/StatBar'
import GradientButton from '../design/components/GradientButton'
import { resolveThemeColors } from '../utils/theme'

const birdImage = require('../../assets/games/flappy-bird.png')

const { width: W, height: SCREEN_H } = Dimensions.get('window')
const H = Math.min(SCREEN_H - 220, 450)
const GRAVITY = 0.5
const JUMP = -8
const PIPE_SPEED = 3
export const PIPE_GAP = 130
const PIPE_SPACING = 180
export const PIPE_WIDTH = 50
export const BIRD_X = W * 0.3
export const BIRD_SIZE = 28
export const BIRD_HITBOX_INSET = 4

export function getBirdBounds(birdX, birdY) {
  return {
    left: birdX + BIRD_HITBOX_INSET,
    right: birdX + BIRD_SIZE - BIRD_HITBOX_INSET,
    top: birdY + BIRD_HITBOX_INSET,
    bottom: birdY + BIRD_SIZE - BIRD_HITBOX_INSET,
  }
}

export function hasPassedPipe(pipeX, birdBounds) {
  return pipeX + PIPE_WIDTH < birdBounds.left
}

export function hasPipeCollision({ pipe, birdX, birdY, previousBirdY = birdY, previousPipeX = pipe.x }) {
  const currentBird = getBirdBounds(birdX, birdY)
  const previousBird = getBirdBounds(birdX, previousBirdY)
  const sweptPipeLeft = Math.min(previousPipeX, pipe.x)
  const sweptPipeRight = Math.max(previousPipeX, pipe.x) + PIPE_WIDTH
  const sweptBirdTop = Math.min(previousBird.top, currentBird.top)
  const sweptBirdBottom = Math.max(previousBird.bottom, currentBird.bottom)
  const overlapsPipeHorizontally = currentBird.right > sweptPipeLeft && currentBird.left < sweptPipeRight

  if (!overlapsPipeHorizontally) return false

  return sweptBirdTop < pipe.topHeight || sweptBirdBottom > pipe.topHeight + PIPE_GAP
}

export default function FlappyBird({ onBack, colors: colorsProp }) {
  const themeColors = resolveThemeColors(colorsProp)
  const [birdY, setBirdY] = useState(H / 2 - BIRD_SIZE / 2)
  const [velocity, setVelocity] = useState(0)
  const [pipes, setPipes] = useState([])
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [started, setStarted] = useState(false)
  const [highScore, setHighScore] = useState(0)

  const pipeIdRef = useRef(0)
  const loopRef = useRef(null)

  // FIX 1: Refs are the sole source of truth for game logic.
  // Removed the syncing useEffects — yRef/velRef are updated directly
  // at the point of change, not via a one-render-late useEffect.
  const velRef = useRef(0)
  const yRef = useRef(H / 2 - BIRD_SIZE / 2)

  // FIX 2: highScoreRef prevents highScore from being a dependency of
  // the game loop useEffect. Without this, every time the score updates
  // the interval is torn down and recreated, causing a mid-game stutter.
  const highScoreRef = useRef(0)

  // FIX 3: gameOverRef acts as an immediate guard inside the interval.
  // setGameOver(true) schedules a re-render, but the interval can still
  // fire several more times before the effect cleanup runs. This ref
  // stops all processing the moment game over is triggered, preventing
  // double storage writes and double sound calls.
  const gameOverRef = useRef(false)

  const gameOverFadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    storage.getGameStats('flappybird').then((s) => {
      if (s.bestScore != null) {
        setHighScore(s.bestScore)
        highScoreRef.current = s.bestScore
      }
    })
  }, [])

  const triggerGameOver = (currentScore) => {
    // Guard: only fire once per game session
    if (gameOverRef.current) return
    gameOverRef.current = true
    setGameOver(true)
    soundManager.playError()

    if (currentScore > highScoreRef.current) {
      highScoreRef.current = currentScore
      setHighScore(currentScore)
      storage.updateGameStats('flappybird', { gamesPlayed: 1, bestScore: currentScore })
    } else {
      storage.updateGameStats('flappybird', { gamesPlayed: 1 })
    }
  }

  const jump = () => {
    if (!started && !gameOver) setStarted(true)
    if (!gameOver) {
      velRef.current = JUMP
      setVelocity(JUMP)
      soundManager.playMove()
    }
  }

  useEffect(() => {
    if (gameOver) {
      gameOverFadeAnim.setValue(0)
      Animated.timing(gameOverFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [gameOver])

  useEffect(() => {
    if (!started || gameOver) {
      if (loopRef.current) {
        clearInterval(loopRef.current)
        loopRef.current = null
      }
      return
    }

    loopRef.current = setInterval(() => {
      // FIX 3 (cont.): bail out immediately if game is already over
      if (gameOverRef.current) return

      const previousBirdY = yRef.current
      velRef.current += GRAVITY
      const ny = yRef.current + velRef.current
      const nextBirdBounds = getBirdBounds(BIRD_X, ny)

      // Boundary collision
      if (nextBirdBounds.top < 0 || nextBirdBounds.bottom > H) {
        // Capture score via functional updater to avoid stale closure
        setScore((s) => {
          triggerGameOver(s)
          return s
        })
        return
      }

      // FIX 1 (cont.): update refs directly here, not via a syncing useEffect
      yRef.current = ny
      setBirdY(ny)
      setVelocity(velRef.current)

      setPipes((prev) => {
        const next = prev
          .map((p) => ({ ...p, x: p.x - PIPE_SPEED }))
          .filter((p) => p.x > -60)
          // FIX 4: use .map() to return a new object instead of mutating p.passed
          .map((p) => {
            if (!p.passed && hasPassedPipe(p.x, nextBirdBounds)) {
              setScore((s) => s + 1)
              soundManager.playSuccess()
              return { ...p, passed: true } // new object, no mutation
            }
            return p
          })

        // Pipe collision — checked after position update
        for (const p of next) {
          if (hasPipeCollision({ pipe: p, birdX: BIRD_X, birdY: yRef.current, previousBirdY, previousPipeX: p.x + PIPE_SPEED })) {
            setScore((s) => {
              triggerGameOver(s)
              return s
            })
            return next
          }
        }

        // Spawn new pipe if needed
        if (next.length === 0 || next[next.length - 1].x < W - PIPE_SPACING) {
          const top = 50 + Math.random() * (H - PIPE_GAP - 120)
          next.push({ id: pipeIdRef.current++, x: W, topHeight: top, passed: false })
        }

        return next
      })
    }, 16)

    return () => {
      if (loopRef.current) clearInterval(loopRef.current)
    }
    // FIX 2: highScore removed from deps. highScoreRef is used inside
    // triggerGameOver instead, so the interval never restarts on score change.
  }, [started, gameOver])

  const reset = () => {
    const initial = H / 2 - BIRD_SIZE / 2
    setBirdY(initial)
    setVelocity(0)
    velRef.current = 0
    yRef.current = initial
    gameOverRef.current = false  // FIX 3: reset the guard on new game
    setPipes([])
    setScore(0)
    setGameOver(false)
    setStarted(false)
    pipeIdRef.current = 0
    soundManager.playClick()
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.bg }]}>
      <LinearGradient
        colors={gradients.flappyBird}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <GradientButton
            gradient={gradients.flappyBird}
            label="← Back"
            onPress={onBack}
            style={styles.backButton}
          />
          <Text style={[styles.title, { color: themeColors.text }]}>Flappy Bird</Text>
          <GradientButton
            gradient={gradients.flappyBird}
            label="Reset"
            onPress={reset}
            style={styles.resetButton}
          />
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <StatBar label="Score" value={score} color={gradients.flappyBird[0]} colors={themeColors} />
        <StatBar label="Best" value={highScore} color={colors.NeonAmber} colors={themeColors} />
      </View>

      <TouchableOpacity style={styles.gameAreaWrapper} onPress={jump} activeOpacity={1}>
        <GlassCard style={styles.gameArea} colors={themeColors}>
          <View
            style={[
              styles.bird,
              {
                left: BIRD_X,
                top: birdY,
                width: BIRD_SIZE,
                height: BIRD_SIZE,
                transform: [{ rotate: `${Math.min(velocity * 3, 45)}deg` }],
              },
            ]}
          >
            <Image
              source={birdImage}
              style={styles.birdImage}
              resizeMode="contain"
              onError={(error) => console.warn('Failed to load bird image:', error)}
            />
          </View>

          {pipes.map((p) => (
            <View key={p.id}>
              <LinearGradient
                colors={gradients.flappyBird}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[styles.pipe, styles.pipeTop, { left: p.x, height: p.topHeight }]}
              />
              <LinearGradient
                colors={[...gradients.flappyBird].reverse()}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[
                  styles.pipe,
                  styles.pipeBottom,
                  { left: p.x, top: p.topHeight + PIPE_GAP, height: H - p.topHeight - PIPE_GAP },
                ]}
              />
            </View>
          ))}

          {gameOver && (
            <Animated.View style={[styles.gameOverContainer, { opacity: gameOverFadeAnim }]}>
              <GlassCard style={styles.gameOverCard} colors={themeColors}>
                <Text style={styles.gameOverText}>Game Over</Text>
                <Text style={[styles.gameOverScore, { color: themeColors.text }]}>Score: {score}</Text>
              </GlassCard>
            </Animated.View>
          )}

          {!started && !gameOver && (
            <View style={styles.hintContainer}>
              <GlassCard style={styles.hintCard} colors={themeColors}>
                <Text style={[styles.hintText, { color: themeColors.textSecondary }]}>Tap to fly!</Text>
              </GlassCard>
            </View>
          )}
        </GlassCard>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  backButton: { minWidth: 80 },
  resetButton: { minWidth: 80 },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  gameAreaWrapper: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    padding: 0,
    borderWidth: 2,
    borderColor: gradients.flappyBird[0],
  },
  bird: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  birdImage: {
    width: BIRD_SIZE,
    height: BIRD_SIZE,
  },
  pipe: {
    position: 'absolute',
    width: PIPE_WIDTH,
    left: 0,
  },
  pipeTop: {
    top: 0,
    borderTopLeftRadius: spacing.sm,
    borderTopRightRadius: spacing.sm,
  },
  pipeBottom: {
    borderBottomLeftRadius: spacing.sm,
    borderBottomRightRadius: spacing.sm,
  },
  gameOverContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 20,
  },
  gameOverCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    minWidth: 200,
  },
  gameOverText: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    color: colors.Danger,
    marginBottom: spacing.md,
  },
  gameOverScore: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.body,
  },
  hintContainer: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 15,
  },
  hintCard: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  hintText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.body,
    textAlign: 'center',
  },
})
