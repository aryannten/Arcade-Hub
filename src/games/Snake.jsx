import { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { storage } from '../utils/storage'
import { soundManager } from '../utils/sounds'
import { colors as designColors, gradients, spacing, typography, shadows } from '../design/tokens'
import GlassCard from '../design/components/GlassCard'
import GradientButton from '../design/components/GradientButton'
import StatBar from '../design/components/StatBar'

const GRID = 18
const CELL = Math.floor((Dimensions.get('window').width - 32) / GRID)
const INIT = [{ x: 9, y: 9 }]
const DIRS = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }

export default function Snake({ onBack, colors }) {
  const [snake, setSnake] = useState(INIT)
  const [food, setFood] = useState({ x: 14, y: 14 })
  const [dir, setDir] = useState(DIRS.right)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [paused, setPaused] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const dirRef = useRef(DIRS.right)
  const loopRef = useRef(null)
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const foodPulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    dirRef.current = dir
  }, [dir])

  useEffect(() => {
    storage.getGameStats('snake').then((s) => {
      if (s.bestScore != null) setHighScore(s.bestScore)
    })
    
    // Entry animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start()
    
    // Food pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(foodPulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(foodPulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        })
      ])
    ).start()
  }, [])

  const genFood = useCallback(() => ({
    x: Math.floor(Math.random() * GRID),
    y: Math.floor(Math.random() * GRID),
  }), [])

  const gameLoop = useCallback(() => {
    if (paused || gameOver) return
    const d = dirRef.current
    setSnake((prev) => {
      const head = { x: prev[0].x + d.x, y: prev[0].y + d.y }
      if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
        setGameOver(true)
        soundManager.playError()
        const sc = score
        const hi = highScore
        if (sc > hi) {
          setHighScore(sc)
          storage.updateGameStats('snake', { gamesPlayed: 1, bestScore: sc })
        } else {
          storage.updateGameStats('snake', { gamesPlayed: 1 })
        }
        return prev
      }
      for (let i = 1; i < prev.length; i++) {
        if (prev[i].x === head.x && prev[i].y === head.y) {
          setGameOver(true)
          soundManager.playError()
          const sc = score
          const hi = highScore
          if (sc > hi) {
            setHighScore(sc)
            storage.updateGameStats('snake', { gamesPlayed: 1, bestScore: sc })
          } else {
            storage.updateGameStats('snake', { gamesPlayed: 1 })
          }
          return prev
        }
      }
      const next = [head, ...prev]
      if (head.x === food.x && head.y === food.y) {
        setScore((s) => s + 1)
        setFood(genFood())
        soundManager.playSuccess()
      } else {
        next.pop()
      }
      return next
    })
  }, [paused, gameOver, food, genFood, score, highScore])

  useEffect(() => {
    if (!gameOver && !paused) {
      loopRef.current = setInterval(gameLoop, 130)
    } else if (loopRef.current) {
      clearInterval(loopRef.current)
      loopRef.current = null
    }
    return () => {
      if (loopRef.current) clearInterval(loopRef.current)
    }
  }, [gameOver, paused, gameLoop])

  const changeDir = (d) => {
    if (gameOver || paused) return
    const cur = dirRef.current
    if (d === 'up' && cur.y === 1) return
    if (d === 'down' && cur.y === -1) return
    if (d === 'left' && cur.x === 1) return
    if (d === 'right' && cur.x === -1) return
    if (d === 'up') { dirRef.current = DIRS.up; setDir(DIRS.up); soundManager.playMove(); return }
    if (d === 'down') { dirRef.current = DIRS.down; setDir(DIRS.down); soundManager.playMove(); return }
    if (d === 'left') { dirRef.current = DIRS.left; setDir(DIRS.left); soundManager.playMove(); return }
    if (d === 'right') { dirRef.current = DIRS.right; setDir(DIRS.right); soundManager.playMove(); return }
  }

  const reset = () => {
    setSnake(INIT)
    setFood(genFood())
    setDir(DIRS.right)
    dirRef.current = DIRS.right
    setGameOver(false)
    setScore(0)
    setPaused(false)
    soundManager.playClick()
  }

  const togglePause = () => {
    if (!gameOver) {
      setPaused((p) => !p)
      soundManager.playClick()
    }
  }

  const size = GRID * CELL

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header with gradient accent */}
        <LinearGradient
          colors={gradients.snake}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <GradientButton
              gradient={gradients.snake}
              label="← Back"
              onPress={onBack}
              style={styles.backButton}
            />
            <Text style={styles.title}>Snake</Text>
            <GradientButton
              gradient={gradients.snake}
              label="Reset"
              onPress={reset}
              style={styles.resetButton}
            />
          </View>
        </LinearGradient>

        {/* Stats with StatBar components */}
        <GlassCard style={styles.statsCard}>
          <StatBar
            label="Score"
            value={score}
            color={designColors.NeonCyan}
          />
          <View style={styles.statSpacer} />
          <StatBar
            label="Best"
            value={highScore}
            color={designColors.NeonCyan}
          />
        </GlassCard>

        {/* Status messages */}
        {paused && (
          <GlassCard style={[styles.statusCard, { borderColor: designColors.NeonAmber }]}>
            <Text style={styles.statusText}>⏸ Paused</Text>
          </GlassCard>
        )}
        {gameOver && (
          <GlassCard style={[styles.statusCard, { borderColor: designColors.Danger }]}>
            <Text style={styles.statusText}>Game Over</Text>
          </GlassCard>
        )}

        {/* Game board with glassmorphism and neon border */}
        <GlassCard style={[styles.boardContainer, shadows.neonGlow]}>
          <View style={[styles.board, { width: size, height: size }]}>
            {/* Food with pulse animation */}
            <Animated.View
              style={[
                styles.food,
                {
                  left: food.x * CELL,
                  top: food.y * CELL,
                  width: CELL - 2,
                  height: CELL - 2,
                  transform: [{ scale: foodPulseAnim }]
                }
              ]}
            />
            {/* Snake segments with gradient coloring */}
            {snake.map((seg, i) => (
              <View
                key={i}
                style={[
                  styles.seg,
                  {
                    left: seg.x * CELL,
                    top: seg.y * CELL,
                    width: CELL - 2,
                    height: CELL - 2,
                    backgroundColor: i === 0 ? gradients.snake[0] : gradients.snake[1],
                    opacity: i === 0 ? 1 : 0.8
                  }
                ]}
              />
            ))}
          </View>
        </GlassCard>

        {/* Control buttons using GradientButton */}
        <View style={styles.controls}>
          <GradientButton
            gradient={gradients.snake}
            label="↑"
            onPress={() => changeDir('up')}
            disabled={gameOver || paused}
            style={styles.arrowUp}
          />
          <View style={styles.midRow}>
            <GradientButton
              gradient={gradients.snake}
              label="←"
              onPress={() => changeDir('left')}
              disabled={gameOver || paused}
              style={styles.arrowSide}
            />
            <GradientButton
              gradient={gradients.snake}
              label={paused ? '▶' : '⏸'}
              onPress={togglePause}
              disabled={gameOver}
              style={styles.arrowSide}
            />
            <GradientButton
              gradient={gradients.snake}
              label="→"
              onPress={() => changeDir('right')}
              disabled={gameOver || paused}
              style={styles.arrowSide}
            />
          </View>
          <GradientButton
            gradient={gradients.snake}
            label="↓"
            onPress={() => changeDir('down')}
            disabled={gameOver || paused}
            style={styles.arrowDown}
          />
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designColors.Background
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40
  },
  headerGradient: {
    borderRadius: spacing.lg,
    padding: 2,
    marginBottom: spacing.md
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: designColors.Background,
    borderRadius: spacing.lg,
    padding: spacing.md
  },
  backButton: {
    minHeight: 44,
    minWidth: 80
  },
  resetButton: {
    minHeight: 44,
    minWidth: 100
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    color: designColors.TextPrimary,
    textAlign: 'center'
  },
  statsCard: {
    marginBottom: spacing.md
  },
  statSpacer: {
    height: spacing.sm
  },
  statusCard: {
    marginBottom: spacing.md,
    borderWidth: 2,
    alignItems: 'center'
  },
  statusText: {
    textAlign: 'center',
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    color: designColors.TextPrimary
  },
  boardContainer: {
    alignSelf: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: designColors.NeonCyan
  },
  board: {
    position: 'relative',
    borderRadius: spacing.md
  },
  food: {
    position: 'absolute',
    backgroundColor: designColors.NeonRed,
    borderRadius: 4,
    ...shadows.neonGlow
  },
  seg: {
    position: 'absolute',
    borderRadius: 4
  },
  controls: {
    alignItems: 'center',
    gap: spacing.sm
  },
  arrowUp: {
    minHeight: 44,
    minWidth: 60
  },
  midRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center'
  },
  arrowSide: {
    minHeight: 44,
    minWidth: 60
  },
  arrowDown: {
    minHeight: 44,
    minWidth: 60
  }
})
