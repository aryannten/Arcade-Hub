import { useState, useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { storage } from '../utils/storage'
import { colors as designColors, gradients, spacing, typography, shadows } from '../design/tokens'
import GlassCard from '../design/components/GlassCard'
import GradientButton from '../design/components/GradientButton'
import StatBar from '../design/components/StatBar'

const CHOICES = [
  { name: 'rock', emoji: '🪨', beats: 'scissors' },
  { name: 'paper', emoji: '📄', beats: 'rock' },
  { name: 'scissors', emoji: '✂️', beats: 'paper' },
]

export default function RockPaperScissors({ onBack, colors }) {
  const [playerChoice, setPlayerChoice] = useState(null)
  const [computerChoice, setComputerChoice] = useState(null)
  const [playerScore, setPlayerScore] = useState(0)
  const [computerScore, setComputerScore] = useState(0)
  const [result, setResult] = useState('')
  const [gameHistory, setGameHistory] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const resultFadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnims = useRef(CHOICES.map(() => new Animated.Value(1))).current

  // Entry animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start()
  }, [])


  const getRandom = () => CHOICES[Math.floor(Math.random() * CHOICES.length)]

  const play = (choice, index) => {
    if (isPlaying) return
    setIsPlaying(true)
    setPlayerChoice(choice)
    setComputerChoice(null)
    setResult('')
    resultFadeAnim.setValue(0)
    
    // Button scale animation
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start()
    
    setTimeout(() => {
      const comp = getRandom()
      setComputerChoice(comp)
      let res = ''
      if (choice.name === comp.name) res = "It's a tie!"
      else if (choice.beats === comp.name) {
        res = 'You win!'
        setPlayerScore((p) => p + 1)
      } else {
        res = 'Computer wins!'
        setComputerScore((c) => c + 1)
      }
      setResult(res)
      
      // Result fade-in animation
      Animated.timing(resultFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start()
      
      setGameHistory((h) => [...h.slice(-4), { player: choice, computer: comp, result: res }])
      const newPlayerScore = res === 'You win!' ? playerScore + 1 : playerScore
      storage.updateGameStats('rockpaperscissors', {
        gamesPlayed: 1,
        gamesWon: res === 'You win!' ? 1 : 0,
        ...(res === 'You win!' && { bestScore: newPlayerScore }),
      })
      setIsPlaying(false)
    }, 600)
  }

  const reset = () => {
    setPlayerChoice(null)
    setComputerChoice(null)
    setPlayerScore(0)
    setComputerScore(0)
    setResult('')
    setGameHistory([])
    setIsPlaying(false)
    resultFadeAnim.setValue(0)
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Header with gradient accent */}
        <LinearGradient
          colors={gradients.rockPaperScissors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <GradientButton
              gradient={gradients.rockPaperScissors}
              label="← Back"
              onPress={onBack}
              style={styles.backButton}
            />
            <Text style={styles.title}>Rock Paper Scissors</Text>
            <GradientButton
              gradient={gradients.rockPaperScissors}
              label="Reset"
              onPress={reset}
              style={styles.resetButton}
            />
          </View>
        </LinearGradient>

        {/* Score display with StatBar components */}
        <GlassCard style={styles.scoreCard}>
          <StatBar
            label="Your Score"
            value={playerScore}
            color={designColors.NeonAmber}
          />
          <View style={styles.statSpacer} />
          <StatBar
            label="Computer Score"
            value={computerScore}
            color={designColors.NeonAmber}
          />
        </GlassCard>

        {/* Arena with glassmorphism styling */}
        <GlassCard style={styles.arena}>
          <View style={styles.choicesRow}>
            <View style={styles.choiceBox}>
              <Text style={styles.choiceLabel}>You</Text>
              <Text style={styles.emojiBig}>{playerChoice ? playerChoice.emoji : '❓'}</Text>
            </View>
            <View style={styles.choiceBox}>
              <Text style={styles.choiceLabel}>Computer</Text>
              <Text style={styles.emojiBig}>{isPlaying ? '🤔' : computerChoice ? computerChoice.emoji : '❓'}</Text>
            </View>
          </View>
          {result ? (
            <Animated.View style={{ opacity: resultFadeAnim }}>
              <Text style={[
                styles.result,
                { color: result.includes('You') ? designColors.Success : result.includes('Computer') ? designColors.Danger : designColors.TextPrimary },
              ]}>
                {result}
              </Text>
            </Animated.View>
          ) : null}
        </GlassCard>

        {/* Choice buttons using GradientButton components */}
        <Text style={styles.pick}>Pick one:</Text>
        <View style={styles.weapons}>
        {CHOICES.map((c, index) => (
          <TouchableOpacity
            key={c.name}
            onPress={() => play(c, index)}
            disabled={isPlaying}
            style={styles.weaponTouchable}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnims[index] }] }}>
              <GlassCard style={styles.weaponBtn}>
                <Text style={styles.weaponEmoji}>{c.emoji}</Text>
                <Text style={styles.weaponName}>{c.name}</Text>
              </GlassCard>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>

        {/* Game history with glassmorphism */}
        {gameHistory.length > 0 && (
          <GlassCard style={styles.history}>
            <Text style={styles.historyTitle}>Last games</Text>
            {gameHistory.slice(-5).reverse().map((g, i) => (
              <View key={i} style={styles.historyRow}>
                <Text style={styles.historyText}>{g.player.emoji} vs {g.computer.emoji}</Text>
                <Text style={[
                  styles.historyRes,
                  { color: g.result.includes('You') ? designColors.Success : g.result.includes('Computer') ? designColors.Danger : designColors.TextMuted }
                ]}>
                  {g.result}
                </Text>
              </View>
            ))}
          </GlassCard>
        )}
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
  scoreCard: {
    marginBottom: spacing.md
  },
  statSpacer: {
    height: spacing.sm
  },
  arena: {
    marginBottom: spacing.md,
    padding: spacing.xl
  },
  choicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md
  },
  choiceBox: {
    alignItems: 'center'
  },
  choiceLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: designColors.TextMuted,
    marginBottom: spacing.xs
  },
  emojiBig: {
    fontSize: 48
  },
  result: {
    textAlign: 'center',
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.heading,
    fontWeight: '600'
  },
  pick: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.heading,
    fontWeight: '600',
    color: designColors.TextPrimary,
    marginBottom: spacing.md
  },
  weapons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl
  },
  weaponTouchable: {
    minHeight: 44,
    minWidth: 90
  },
  weaponBtn: {
    padding: spacing.lg,
    alignItems: 'center',
    minWidth: 90,
    minHeight: 100
  },
  weaponEmoji: {
    fontSize: 36,
    marginBottom: spacing.xs
  },
  weaponName: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: designColors.TextPrimary,
    textTransform: 'capitalize'
  },
  history: {
    padding: spacing.md
  },
  historyTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.heading,
    fontWeight: '600',
    color: designColors.TextPrimary,
    marginBottom: spacing.sm
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs
  },
  historyText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: designColors.TextPrimary
  },
  historyRes: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body
  }
})
