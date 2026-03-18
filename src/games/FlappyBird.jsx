import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { storage } from '../utils/storage'
import { soundManager } from '../utils/sounds'
import { colors, gradients, spacing, typography } from '../design/tokens'
import GlassCard from '../design/components/GlassCard'
import StatBar from '../design/components/StatBar'
import GradientButton from '../design/components/GradientButton'

const { width: W, height: SCREEN_H } = Dimensions.get('window')
const H = Math.min(SCREEN_H - 220, 450) // Responsive height
const GRAVITY = 0.5
const JUMP = -8
const PIPE_SPEED = 3
const PIPE_GAP = 100
const PIPE_SPACING = 180
const BIRD_X = W * 0.3
const BIRD_SIZE = 28

export default function FlappyBird({ onBack, colors: colorsProp }) {
  const [birdY, setBirdY] = useState(H / 2 - BIRD_SIZE / 2)
  const [velocity, setVelocity] = useState(0)
  const [pipes, setPipes] = useState([])
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [started, setStarted] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const pipeIdRef = useRef(0)
  const loopRef = useRef(null)
  const velRef = useRef(0)
  const yRef = useRef(H / 2 - BIRD_SIZE / 2)
  
  // Animation values
  const gameOverFadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    yRef.current = birdY
  }, [birdY])
  useEffect(() => {
    velRef.current = velocity
  }, [velocity])

  useEffect(() => {
    storage.getGameStats('flappybird').then((s) => {
      if (s.bestScore != null) setHighScore(s.bestScore)
    })
  }, [])

  const jump = () => {
    if (!started && !gameOver) setStarted(true)
    if (!gameOver) {
      velRef.current = JUMP
      setVelocity(JUMP)
      soundManager.playMove()
    }
  }

  const hit = (pipe, by) => {
    const bx = BIRD_X
    if (bx < pipe.x + 50 && bx + BIRD_SIZE > pipe.x) {
      if (by < pipe.topHeight || by + BIRD_SIZE > pipe.topHeight + PIPE_GAP) return true
    }
    return false
  }
  
  // Trigger game over fade-in animation
  useEffect(() => {
    if (gameOver) {
      gameOverFadeAnim.setValue(0)
      Animated.timing(gameOverFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
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
      velRef.current += GRAVITY
      setVelocity(velRef.current)
      const ny = yRef.current + velRef.current
      if (ny < 0 || ny > H - BIRD_SIZE) {
        setGameOver(true)
        soundManager.playError()
        setScore((s) => {
          if (s > highScore) {
            setHighScore(s)
            storage.updateGameStats('flappybird', { gamesPlayed: 1, bestScore: s })
          } else {
            storage.updateGameStats('flappybird', { gamesPlayed: 1 })
          }
          return s
        })
      } else {
        yRef.current = ny
        setBirdY(ny)
      }

      setPipes((prev) => {
        let next = prev.map((p) => ({ ...p, x: p.x - PIPE_SPEED })).filter((p) => p.x > -60)
        next.forEach((p) => {
          if (hit(p, yRef.current)) {
            setGameOver(true)
            soundManager.playError()
            setScore((s) => {
              if (s > highScore) {
                setHighScore(s)
                storage.updateGameStats('flappybird', { gamesPlayed: 1, bestScore: s })
              } else {
                storage.updateGameStats('flappybird', { gamesPlayed: 1 })
              }
              return s
            })
          }
          if (p.x < BIRD_X && p.x + 50 > BIRD_X && !p.passed) {
            p.passed = true
            setScore((s) => s + 1)
            soundManager.playSuccess()
          }
        })
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
  }, [started, gameOver, highScore])

  const reset = () => {
    setBirdY(H / 2 - BIRD_SIZE / 2)
    setVelocity(0)
    velRef.current = 0
    yRef.current = H / 2 - BIRD_SIZE / 2
    setPipes([])
    setScore(0)
    setGameOver(false)
    setStarted(false)
    pipeIdRef.current = 0
    soundManager.playClick()
  }

  return (
    <View style={styles.container}>
      {/* Header with gradient accent */}
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
          <Text style={styles.title}>Flappy Bird</Text>
          <GradientButton
            gradient={gradients.flappyBird}
            label="Reset"
            onPress={reset}
            style={styles.resetButton}
          />
        </View>
      </LinearGradient>

      {/* Stats display */}
      <View style={styles.statsContainer}>
        <StatBar
          label="Score"
          value={score}
          color={gradients.flappyBird[0]}
        />
        <StatBar
          label="Best"
          value={highScore}
          color={colors.NeonAmber}
        />
      </View>

      {/* Game area with glassmorphism */}
      <TouchableOpacity
        style={styles.gameAreaWrapper}
        onPress={jump}
        activeOpacity={1}
      >
        <GlassCard style={styles.gameArea}>
          {/* Bird with rotation animation */}
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
            <Text style={styles.birdEmoji}>🐦</Text>
          </View>
          
          {/* Pipes with gradient coloring */}
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
          
          {/* Game over message with fade-in animation */}
          {gameOver && (
            <Animated.View
              style={[
                styles.gameOverContainer,
                {
                  opacity: gameOverFadeAnim
                }
              ]}
            >
              <GlassCard style={styles.gameOverCard}>
                <Text style={styles.gameOverText}>Game Over</Text>
                <Text style={styles.gameOverScore}>Score: {score}</Text>
              </GlassCard>
            </Animated.View>
          )}
          
          {/* Start hint */}
          {!started && !gameOver && (
            <View style={styles.hintContainer}>
              <GlassCard style={styles.hintCard}>
                <Text style={styles.hintText}>Tap to fly!</Text>
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
    backgroundColor: colors.Background
  },
  headerGradient: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg
  },
  backButton: {
    minWidth: 80
  },
  resetButton: {
    minWidth: 80
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    color: colors.TextPrimary
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg
  },
  gameAreaWrapper: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: gradients.flappyBird[0]
  },
  bird: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  birdEmoji: {
    fontSize: 24
  },
  pipe: {
    position: 'absolute',
    width: 50,
    left: 0
  },
  pipeTop: {
    top: 0,
    borderTopLeftRadius: spacing.sm,
    borderTopRightRadius: spacing.sm
  },
  pipeBottom: {
    borderBottomLeftRadius: spacing.sm,
    borderBottomRightRadius: spacing.sm
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
    zIndex: 20
  },
  gameOverCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    minWidth: 200
  },
  gameOverText: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    color: colors.Danger,
    marginBottom: spacing.md
  },
  gameOverScore: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.body,
    color: colors.TextPrimary
  },
  hintContainer: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 15
  },
  hintCard: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl
  },
  hintText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.body,
    color: colors.TextMuted,
    textAlign: 'center'
  }
})
