import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { storage } from '../utils/storage'
import { colors as designColors, gradients, spacing, typography, shadows } from '../design/tokens'
import GlassCard from '../design/components/GlassCard'
import GradientButton from '../design/components/GradientButton'
import StatBar from '../design/components/StatBar'
import DifficultyBadge from '../design/components/DifficultyBadge'
import { resolveThemeColors } from '../utils/theme'

const DIFF = { easy: { pairs: 6, cols: 3 }, medium: { pairs: 8, cols: 4 }, hard: { pairs: 12, cols: 4 } }
const EMOJIS = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎺', '🎸', '🎹', '🎤', '🎧', '🎬']

export default function MemoryGame({ onBack, colors }) {
  const themeColors = resolveThemeColors(colors)
  const isLight = themeColors.name === 'light'
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [difficulty, setDifficulty] = useState('easy')
  const [timer, setTimer] = useState(0)
  const timerRef = useRef(null)
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  const init = (diff = difficulty) => {
    const { pairs } = DIFF[diff]
    const emojis = EMOJIS.slice(0, pairs)
    const raw = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((e, i) => ({ id: i, emoji: e }))
    setCards(raw)
    setFlipped([])
    setMatched([])
    setMoves(0)
    setGameWon(false)
    setTimer(0)
  }

  useEffect(() => {
    init()
    // Entry animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start()
  }, [difficulty])

  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped
      if (cards[a].emoji === cards[b].emoji) {
        setTimeout(() => {
          setMatched((m) => [...m, a, b])
          setFlipped([])
        }, 500)
      } else {
        setTimeout(() => setFlipped([]), 800)
      }
      setMoves((m) => m + 1)
    }
  }, [flipped, cards])

  useEffect(() => {
    if (!gameWon && cards.length > 0) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameWon, cards.length])

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setGameWon(true)
      storage.updateGameStats('memory', { gamesPlayed: 1, gamesWon: 1, score: moves })
      // Win pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 300,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
          })
        ])
      ).start()
    }
  }, [matched.length, cards.length, moves])

  const tap = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return
    setFlipped((f) => [...f, id])
  }

  const visible = (id) => flipped.includes(id) || matched.includes(id)
  const { pairs, cols } = DIFF[difficulty]

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.bg }]} contentContainerStyle={styles.content}>
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Header with gradient accent */}
        <LinearGradient
          colors={gradients.memoryMatch}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={[styles.header, { backgroundColor: themeColors.bg }]}>
            <GradientButton
              gradient={gradients.memoryMatch}
              label="← Back"
              onPress={onBack}
              style={styles.backButton}
            />
            <Text style={[styles.title, { color: themeColors.text }]}>Memory Match</Text>
            <GradientButton
              gradient={gradients.memoryMatch}
              label="Restart"
              onPress={() => init()}
              style={styles.restartButton}
            />
          </View>
        </LinearGradient>

        {/* Difficulty selector with badges */}
        <View style={styles.diffRow}>
          {Object.keys(DIFF).map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => setDifficulty(d)}
              style={[
                styles.diffBtn,
                difficulty === d && styles.diffBtnActive
              ]}
            >
              <DifficultyBadge difficulty={d} size="small" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats with StatBar components */}
        <GlassCard style={styles.statsCard} colors={themeColors}>
          <StatBar
            label="Moves"
            value={moves}
            color={designColors.NeonPurple}
            colors={themeColors}
          />
          <View style={styles.statSpacer} />
          <StatBar
            label="Matches"
            value={`${matched.length / 2} / ${pairs}`}
            color={designColors.NeonPurple}
            colors={themeColors}
          />
          <View style={styles.statSpacer} />
          <StatBar
            label="Time"
            value={`${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`}
            color={designColors.NeonPurple}
            colors={themeColors}
          />
        </GlassCard>

        {/* Win message with pulse animation */}
        {gameWon && (
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <GlassCard style={[styles.winCard, shadows.neonGlowPurple]} colors={themeColors}>
              <Text style={[styles.winText, { color: themeColors.text }]}>You won in {moves} moves!</Text>
            </GlassCard>
          </Animated.View>
        )}

        {/* Game grid with glassmorphism cards */}
        <View style={[styles.grid, { maxWidth: cols * 76 }]}>
          {cards.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => tap(c.id)}
              style={styles.cardTouchable}
            >
              <GlassCard
                style={[
                  styles.card,
                  visible(c.id) && styles.cardFlipped,
                  visible(c.id) && {
                    backgroundColor: isLight ? 'rgba(147, 51, 234, 0.14)' : designColors.NeonPurple + '40',
                  },
                ]}
                colors={themeColors}
              >
                <Text style={styles.cardEmoji}>{visible(c.id) ? c.emoji : '?'}</Text>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
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
    borderRadius: spacing.lg,
    padding: spacing.md
  },
  backButton: {
    minHeight: 44,
    minWidth: 80
  },
  restartButton: {
    minHeight: 44,
    minWidth: 100
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  diffRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    justifyContent: 'center'
  },
  diffBtn: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: spacing.sm
  },
  diffBtnActive: {
    ...shadows.neonGlowPurple
  },
  statsCard: {
    marginBottom: spacing.md
  },
  statSpacer: {
    height: spacing.sm
  },
  winCard: {
    marginBottom: spacing.md,
    backgroundColor: designColors.Success + '20',
    borderColor: designColors.Success,
    borderWidth: 1
  },
  winText: {
    textAlign: 'center',
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignSelf: 'center'
  },
  cardTouchable: {
    minHeight: 68,
    minWidth: 68
  },
  card: {
    width: 68,
    height: 68,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardFlipped: {
    ...shadows.neonGlowPurple
  },
  cardEmoji: {
    fontSize: 28
  }
})
