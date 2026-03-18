import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { storage } from '../utils/storage'
import { soundManager } from '../utils/sounds'
import { colors as designColors, gradients, spacing, typography, shadows } from '../design/tokens'
import GlassCard from '../design/components/GlassCard'
import GradientButton from '../design/components/GradientButton'
import NeonText from '../design/components/NeonText'

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]

function checkWinner(sq) {
  for (const [a,b,c] of LINES) {
    if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) return sq[a]
  }
  return null
}

function getAvailable(sq) {
  return sq.map((s, i) => (s === null ? i : null)).filter((x) => x != null)
}

function makeComputerMove(sq) {
  const moves = getAvailable(sq)
  if (!moves.length) return sq
  for (const m of moves) {
    const t = [...sq]
    t[m] = 'O'
    if (checkWinner(t) === 'O') return t
  }
  for (const m of moves) {
    const t = [...sq]
    t[m] = 'X'
    if (checkWinner(t) === 'X') {
      const out = [...sq]
      out[m] = 'O'
      return out
    }
  }
  const out = [...sq]
  out[moves[Math.floor(Math.random() * moves.length)]] = 'O'
  return out
}

export default function TicTacToe({ onBack, colors }) {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [winner, setWinner] = useState(null)
  const [mode, setMode] = useState('select')
  const [thinking, setThinking] = useState(false)
  const [xWins, setXWins] = useState(0)
  const [oWins, setOWins] = useState(0)
  const [draws, setDraws] = useState(0)
  const drawRef = useRef(false)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const cellScaleAnims = useRef(Array(9).fill(null).map(() => new Animated.Value(1))).current
  const winPulseAnim = useRef(new Animated.Value(1)).current

  const isDraw = !winner && board.every((c) => c != null)

  useEffect(() => {
    if (isDraw && !winner && !drawRef.current) {
      drawRef.current = true
      setDraws((d) => d + 1)
      storage.updateGameStats('tictactoe', { gamesPlayed: 1, gamesWon: 0 })
    }
    if (winner || !isDraw) drawRef.current = false
  }, [isDraw, winner])

  // Entry animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start()
  }, [mode])

  // Winning cells pulse animation
  useEffect(() => {
    if (winner) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(winPulseAnim, {
            toValue: 1.1,
            duration: 300,
            useNativeDriver: true
          }),
          Animated.timing(winPulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
          })
        ])
      ).start()
    } else {
      winPulseAnim.setValue(1)
    }
  }, [winner])

  useEffect(() => {
    if (mode !== 'computer' || isXNext || winner || thinking) return
    setThinking(true)
    const t = setTimeout(() => {
      const next = makeComputerMove(board)
      setBoard(next)
      const w = checkWinner(next)
      if (w) {
        setWinner(w)
        if (w === 'O') {
          setOWins((o) => o + 1)
          storage.updateGameStats('tictactoe', { gamesPlayed: 1, gamesWon: 0 })
        } else {
          setXWins((x) => x + 1)
          storage.updateGameStats('tictactoe', { gamesPlayed: 1, gamesWon: 1 })
        }
      } else {
        setIsXNext(true)
      }
      setThinking(false)
    }, 400)
    return () => clearTimeout(t)
  }, [mode, isXNext, board, winner, thinking])

  const play = (i) => {
    if (board[i] || winner || thinking) return
    
    // Cell tap scale animation
    Animated.sequence([
      Animated.timing(cellScaleAnims[i], {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(cellScaleAnims[i], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start()

    const next = [...board]
    next[i] = isXNext ? 'X' : 'O'
    setBoard(next)
    const w = checkWinner(next)
    if (w) {
      setWinner(w)
      if (w === 'X') {
        setXWins((x) => x + 1)
        if (mode === 'computer') storage.updateGameStats('tictactoe', { gamesPlayed: 1, gamesWon: 1 })
        else storage.updateGameStats('tictactoe', { gamesPlayed: 1, gamesWon: 0 })
      } else {
        setOWins((o) => o + 1)
        storage.updateGameStats('tictactoe', { gamesPlayed: 1, gamesWon: 0 })
      }
    } else {
      setIsXNext(!isXNext)
    }
    soundManager.playMove()
  }

  const reset = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setWinner(null)
    setThinking(false)
    drawRef.current = false
    // Reset cell animations
    cellScaleAnims.forEach(anim => anim.setValue(1))
  }

  const newRound = () => reset()
  const resetScore = () => {
    setXWins(0)
    setOWins(0)
    setDraws(0)
    reset()
  }

  const start = (m) => {
    setMode(m)
    reset()
  }

  if (mode === 'select') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header with gradient accent */}
          <LinearGradient
            colors={gradients.ticTacToe}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <GradientButton
                gradient={gradients.ticTacToe}
                label="← Back"
                onPress={onBack}
                style={styles.backButton}
              />
              <Text style={styles.title}>Tic Tac Toe</Text>
              <View style={styles.placeholder} />
            </View>
          </LinearGradient>

          <NeonText 
            color={designColors.NeonRed} 
            size={18} 
            style={styles.subtitle}
          >
            Choose mode
          </NeonText>

          <View style={styles.modeRow}>
            <TouchableOpacity
              onPress={() => start('computer')}
              style={styles.modeTouchable}
            >
              <GlassCard style={styles.modeCard}>
                <Text style={styles.modeEmoji}>🤖</Text>
                <Text style={styles.modeTitle}>vs Computer</Text>
              </GlassCard>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => start('player')}
              style={styles.modeTouchable}
            >
              <GlassCard style={styles.modeCard}>
                <Text style={styles.modeEmoji}>👥</Text>
                <Text style={styles.modeTitle}>vs Player</Text>
              </GlassCard>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    )
  }

  const status = winner
    ? mode === 'computer'
      ? winner === 'X' ? 'You win! 🎉' : 'Computer wins 🤖'
      : winner === 'X' ? 'Player 1 wins! 🎉' : 'Player 2 wins! 🎉'
    : isDraw
      ? "It's a draw! 🤝"
      : thinking
        ? 'Thinking...'
        : isXNext ? (mode === 'computer' ? 'Your turn (X)' : 'Player 1 (X)') : (mode === 'computer' ? "Computer's turn (O)" : 'Player 2 (O)')

  // Find winning line for animation
  const getWinningLine = () => {
    if (!winner) return []
    for (const [a, b, c] of LINES) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return [a, b, c]
      }
    }
    return []
  }
  const winningLine = getWinningLine()

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.gameContent}>
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Header with gradient accent */}
        <LinearGradient
          colors={gradients.ticTacToe}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <GradientButton
              gradient={gradients.ticTacToe}
              label="← Mode"
              onPress={() => setMode('select')}
              style={styles.backButton}
            />
            <Text style={styles.title} numberOfLines={1}>
              Tic Tac Toe · {mode === 'computer' ? 'vs Computer' : 'vs Player'}
            </Text>
            <View style={styles.headerRight}>
              <GradientButton
                gradient={gradients.ticTacToe}
                label="New"
                onPress={newRound}
                style={styles.smallButton}
              />
              <GradientButton
                gradient={gradients.ticTacToe}
                label="Reset"
                onPress={resetScore}
                style={styles.smallButton}
              />
            </View>
          </View>
        </LinearGradient>

        {/* Scores with glassmorphism */}
        <GlassCard style={styles.scoresCard}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>{mode === 'computer' ? 'You' : 'P1'}</Text>
            <Text style={styles.scoreVal}>{xWins}</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Draws</Text>
            <Text style={styles.scoreVal}>{draws}</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>{mode === 'computer' ? 'Computer' : 'P2'}</Text>
            <Text style={styles.scoreVal}>{oWins}</Text>
          </View>
        </GlassCard>

        {/* Current player with NeonText */}
        <NeonText 
          color={designColors.NeonRed} 
          size={18} 
          style={styles.status}
        >
          {status}
        </NeonText>

        {/* Game board with glassmorphism cells */}
        <GlassCard style={styles.boardContainer}>
          <View style={styles.board}>
            {board.map((cell, i) => {
              const isWinningCell = winningLine.includes(i)
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => play(i)}
                  disabled={!!cell || !!winner || thinking}
                  style={styles.cellTouchable}
                >
                  <Animated.View
                    style={{
                      transform: [
                        { scale: isWinningCell ? winPulseAnim : cellScaleAnims[i] }
                      ]
                    }}
                  >
                    <GlassCard
                      style={[
                        styles.cell,
                        cell && styles.cellFilled,
                        isWinningCell && styles.cellWinning
                      ]}
                    >
                      <Text style={styles.cellText}>{cell}</Text>
                    </GlassCard>
                  </Animated.View>
                </TouchableOpacity>
              )
            })}
          </View>
        </GlassCard>
      </Animated.View>
    </ScrollView>
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
  gameContent: {
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
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  backButton: {
    minHeight: 44,
    minWidth: 80
  },
  smallButton: {
    minHeight: 44,
    minWidth: 60
  },
  placeholder: {
    width: 80
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    color: designColors.TextPrimary,
    textAlign: 'center',
    flex: 1
  },
  subtitle: {
    marginBottom: spacing.lg,
    textAlign: 'center'
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    justifyContent: 'center'
  },
  modeTouchable: {
    minHeight: 44,
    minWidth: 120
  },
  modeCard: {
    alignItems: 'center',
    minWidth: 120,
    minHeight: 120,
    justifyContent: 'center'
  },
  modeEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm
  },
  modeTitle: {
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    color: designColors.TextPrimary,
    fontSize: typography.fontSize.md
  },
  scoresCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md
  },
  scoreItem: {
    alignItems: 'center'
  },
  scoreLabel: {
    fontSize: typography.fontSize.xs,
    color: designColors.TextMuted,
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamily.body
  },
  scoreVal: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    color: designColors.TextPrimary
  },
  status: {
    textAlign: 'center',
    marginBottom: spacing.md
  },
  boardContainer: {
    alignSelf: 'center',
    padding: spacing.sm
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 300,
    height: 300
  },
  cellTouchable: {
    width: '33.33%',
    height: '33.33%',
    padding: spacing.xs,
    minHeight: 44,
    minWidth: 44
  },
  cell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cellFilled: {
    backgroundColor: designColors.NeonRed + '20'
  },
  cellWinning: {
    backgroundColor: designColors.NeonRed + '40',
    borderColor: designColors.NeonRed,
    borderWidth: 2,
    ...shadows.neonGlow
  },
  cellText: {
    fontSize: 40,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    color: designColors.TextPrimary
  }
})
