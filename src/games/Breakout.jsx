import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, PanResponder, Animated } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { storage } from '../utils/storage'
import { soundManager } from '../utils/sounds'
import { colors, gradients, spacing, typography } from '../design/tokens'
import GlassCard from '../design/components/GlassCard'
import StatBar from '../design/components/StatBar'
import GradientButton from '../design/components/GradientButton'
import NeonText from '../design/components/NeonText'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')
const W = SCREEN_W - 32
const H = Math.min(SCREEN_H - 250, 420) // Responsive height
const PADDLE_W = 90
const PADDLE_H = 14
const BALL = 14
const COLS = 8
const ROWS = 5
const BRICK_W = (W - 20) / COLS - 4
const BRICK_H = 22

function makeBricks() {
  const out = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      out.push({
        id: `${r}-${c}`,
        x: 10 + c * (BRICK_W + 4),
        y: 50 + r * (BRICK_H + 4),
        hit: false,
        fadeAnim: new Animated.Value(1), // Add fade animation value
      })
    }
  }
  return out
}

function hitRect(ball, x, y, w, h) {
  return (
    ball.x < x + w &&
    ball.x + BALL > x &&
    ball.y < y + h &&
    ball.y + BALL > y
  )
}

export default function Breakout({ onBack, colors }) {
  const [paddleX, setPaddleX] = useState((W - PADDLE_W) / 2)
  const [ball, setBall] = useState({ x: W / 2 - BALL / 2, y: H - 80, dx: 3, dy: -3 })
  const [bricks, setBricks] = useState([])
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [started, setStarted] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const paddleRef = useRef((W - PADDLE_W) / 2)

  useEffect(() => {
    setBricks(makeBricks())
    storage.getGameStats('breakout').then((s) => {
      if (s.bestScore != null) setHighScore(s.bestScore)
    })
  }, [])

  useEffect(() => {
    paddleRef.current = paddleX
  }, [paddleX])

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        let x = paddleRef.current + g.dx
        x = Math.max(0, Math.min(W - PADDLE_W, x))
        setPaddleX(x)
        paddleRef.current = x
      },
    })
  ).current

  const startGame = () => {
    if (!started && !gameOver && !won) {
      setStarted(true)
      soundManager.playClick()
    }
  }

  useEffect(() => {
    if (!started || gameOver || won) return
    const iv = setInterval(() => {
      const px = paddleRef.current
      setBall((prev) => {
        let b = { ...prev, x: prev.x + prev.dx, y: prev.y + prev.dy }
        if (b.x <= 0 || b.x >= W - BALL) b = { ...b, dx: -b.dx }
        if (b.y <= 0) b = { ...b, dy: -b.dy }
        if (
          b.y + BALL >= H - PADDLE_H - 20 &&
          b.y < H &&
          b.x + BALL > px &&
          b.x < px + PADDLE_W
        ) {
          const hitPos = (b.x - px) / PADDLE_W
          b = { ...b, dy: -Math.abs(b.dy), dx: (hitPos - 0.5) * 6, y: H - PADDLE_H - 20 - BALL }
          soundManager.playMatch()
        }
        setBricks((br) => {
          let next = br
          for (const brick of br) {
            if (brick.hit) continue
            if (!hitRect(b, brick.x, brick.y, BRICK_W, BRICK_H)) continue
            // Trigger fade-out animation
            Animated.timing(brick.fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true
            }).start()
            next = br.map((x) => (x.id === brick.id ? { ...x, hit: true } : x))
            setScore((s) => s + 10)
            soundManager.playSuccess()
            const cx = brick.x + BRICK_W / 2
            const cy = brick.y + BRICK_H / 2
            const bcx = b.x + BALL / 2
            const bcy = b.y + BALL / 2
            const dx = bcx - cx
            const dy = bcy - cy
            if (Math.abs(dx) > Math.abs(dy)) b.dx = dx > 0 ? Math.abs(b.dx) : -Math.abs(b.dx)
            else b.dy = dy > 0 ? Math.abs(b.dy) : -Math.abs(b.dy)
            break
          }
          return next
        })
        if (b.y > H) {
          setLives((l) => {
            const n = l - 1
            if (n <= 0) {
              setGameOver(true)
              soundManager.playError()
              setScore((s) => {
                if (s > highScore) {
                  setHighScore(s)
                  storage.updateGameStats('breakout', { gamesPlayed: 1, bestScore: s })
                } else {
                  storage.updateGameStats('breakout', { gamesPlayed: 1 })
                }
                return s
              })
            } else {
              soundManager.playError()
              setStarted(false)
              setBall({ x: W / 2 - BALL / 2, y: H - 80, dx: 3, dy: -3 })
            }
            return n
          })
          return prev
        }
        setBricks((br) => {
          if (br.every((brick) => brick.hit)) {
            setWon(true)
            soundManager.playWin()
            setScore((s) => {
              if (s > highScore) {
                setHighScore(s)
                storage.updateGameStats('breakout', { gamesPlayed: 1, gamesWon: 1, bestScore: s })
              } else {
                storage.updateGameStats('breakout', { gamesPlayed: 1, gamesWon: 1 })
              }
              return s
            })
          }
          return br
        })
        return b
      })
    }, 16)
    return () => clearInterval(iv)
  }, [started, gameOver, won, highScore])

  const reset = () => {
    setBall({ x: W / 2 - BALL / 2, y: H - 80, dx: 3, dy: -3 })
    setPaddleX((W - PADDLE_W) / 2)
    paddleRef.current = (W - PADDLE_W) / 2
    setScore(0)
    setLives(3)
    setGameOver(false)
    setWon(false)
    setStarted(false)
    setBricks(makeBricks())
    soundManager.playClick()
  }

  return (
    <View style={styles.container}>
      {/* Header with gradient accent */}
      <LinearGradient
        colors={gradients.breakout}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <GradientButton
            gradient={gradients.breakout}
            label="← Back"
            onPress={onBack}
            style={styles.backButton}
          />
          <NeonText color="#EC4899" size={24}>
            Breakout
          </NeonText>
          <GradientButton
            gradient={gradients.breakout}
            label="Reset"
            onPress={reset}
            style={styles.resetButton}
          />
        </View>
      </LinearGradient>

      {/* Stats display using StatBar */}
      <View style={styles.statsContainer}>
        <StatBar label="Score" value={score} color="#EC4899" />
        <StatBar label="Best" value={highScore} color="#EC4899" />
        <StatBar label="Lives" value={lives} color="#EC4899" />
      </View>

      {/* Game status messages */}
      {gameOver && (
        <View style={styles.messageContainer}>
          <NeonText color={colors.Danger} size={20}>Game Over</NeonText>
        </View>
      )}
      {won && (
        <View style={styles.messageContainer}>
          <NeonText color={colors.Success} size={20}>🎉 You Won!</NeonText>
        </View>
      )}
      {!started && !gameOver && !won && (
        <View style={styles.messageContainer}>
          <Text style={styles.hint}>Drag paddle, tap to launch</Text>
        </View>
      )}

      {/* Launch button */}
      {!started && !gameOver && !won && (
        <View style={styles.launchContainer}>
          <GradientButton
            gradient={gradients.breakout}
            label="Tap to launch ball"
            onPress={startGame}
          />
        </View>
      )}

      {/* Game area with glassmorphism */}
      <GlassCard style={styles.gameArea}>
        <View
          style={styles.playArea}
          {...pan.panHandlers}
        >
          {/* Render bricks with gradient and neon borders */}
          {bricks.map((b) => (
            <Animated.View
              key={b.id}
              style={[
                styles.brickContainer,
                {
                  left: b.x,
                  top: b.y,
                  width: BRICK_W,
                  height: BRICK_H,
                  opacity: b.fadeAnim
                }
              ]}
            >
              <LinearGradient
                colors={gradients.breakout}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.brick}
              />
            </Animated.View>
          ))}

          {/* Paddle with gradient styling */}
          <View
            style={[
              styles.paddleContainer,
              {
                left: paddleX,
                top: H - PADDLE_H - 10,
                width: PADDLE_W,
                height: PADDLE_H,
              },
            ]}
          >
            <LinearGradient
              colors={gradients.breakout}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.paddle}
            />
          </View>

          {/* Ball */}
          {started && (
            <View
              style={[
                styles.ball,
                { left: ball.x, top: ball.y, width: BALL, height: BALL },
              ]}
            />
          )}
        </View>
      </GlassCard>
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
  statsContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm
  },
  messageContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md
  },
  hint: {
    color: colors.TextMuted,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body
  },
  launchContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md
  },
  gameArea: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: 0
  },
  playArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: spacing.md
  },
  brickContainer: {
    position: 'absolute',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#EC4899',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4
  },
  brick: {
    flex: 1,
    borderRadius: 2
  },
  paddleContainer: {
    position: 'absolute',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#EC4899',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 6
  },
  paddle: {
    flex: 1,
    borderRadius: 4
  },
  ball: {
    position: 'absolute',
    borderRadius: BALL / 2,
    backgroundColor: colors.TextPrimary,
    shadowColor: colors.NeonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5
  }
})
