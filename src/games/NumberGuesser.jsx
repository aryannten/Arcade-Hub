import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Animated, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { storage } from '../utils/storage'
import { colors as designColors, gradients, spacing, typography, shadows } from '../design/tokens'
import GlassCard from '../design/components/GlassCard'
import GradientButton from '../design/components/GradientButton'
import NeonText from '../design/components/NeonText'
import { resolveThemeColors } from '../utils/theme'

const DIFFICULTIES = [
  { min: 1, max: 10, label: 'Easy', caption: '1 to 10' },
  { min: 1, max: 50, label: 'Medium', caption: '1 to 50' },
  { min: 1, max: 100, label: 'Hard', caption: '1 to 100' },
]

function getDifficultyKey(range) {
  return `${range.min}-${range.max}`
}

function getIdealGuessCount(range) {
  return Math.ceil(Math.log2(range.max - range.min + 1))
}

function getRangeHint(history, range) {
  let min = range.min
  let max = range.max

  history.forEach((entry) => {
    if (entry.result === 'low') min = Math.max(min, entry.guess + 1)
    if (entry.result === 'high') max = Math.min(max, entry.guess - 1)
  })

  return { min, max }
}

function getMessageTone(result, gameWon, themeColors) {
  if (gameWon) return designColors.Success
  if (result === 'invalid') return designColors.NeonAmber
  if (result === 'high') return designColors.Danger
  if (result === 'low') return designColors.NeonCyan
  return themeColors.text
}

export default function NumberGuesser({ onBack, colors }) {
  const themeColors = resolveThemeColors(colors)
  const isLight = themeColors.name === 'light'
  const textPrimaryStyle = { color: themeColors.text }
  const textSecondaryStyle = { color: themeColors.textSecondary }
  const heroSurfaceStyle = { backgroundColor: isLight ? 'rgba(255,255,255,0.92)' : '#09101F' }
  const targetCardStyle = {
    borderColor: isLight ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.28)',
    backgroundColor: isLight ? 'rgba(59, 130, 246, 0.08)' : 'rgba(30, 58, 138, 0.18)',
  }
  const inputSurfaceStyle = {
    borderColor: isLight ? themeColors.border : 'rgba(59, 130, 246, 0.35)',
    backgroundColor: isLight ? 'rgba(255,255,255,0.94)' : 'rgba(255, 255, 255, 0.06)',
  }
  const historyRowStyle = {
    borderColor: isLight ? themeColors.border : 'rgba(255,255,255,0.08)',
    backgroundColor: isLight ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.04)',
  }
  const [range, setRange] = useState(DIFFICULTIES[2])
  const [targetNumber, setTargetNumber] = useState(0)
  const [guess, setGuess] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [message, setMessage] = useState('')
  const [lastResult, setLastResult] = useState('idle')
  const [gameWon, setGameWon] = useState(false)
  const [guessHistory, setGuessHistory] = useState([])

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(16)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  const hintRange = useMemo(() => getRangeHint(guessHistory, range), [guessHistory, range])

  const startNewGame = (nextRange = range) => {
    const newTarget = Math.floor(Math.random() * (nextRange.max - nextRange.min + 1)) + nextRange.min
    setTargetNumber(newTarget)
    setGuess('')
    setAttempts(0)
    setGuessHistory([])
    setGameWon(false)
    setLastResult('idle')
    setMessage(`Pick a number from ${nextRange.min} to ${nextRange.max}.`)
    pulseAnim.setValue(1)
  }

  useEffect(() => {
    startNewGame(range)
    fadeAnim.setValue(0)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start()
  }, [])

  const animateFeedback = (didWin) => {
    slideAnim.setValue(16)
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start()

    if (!didWin) return

    pulseAnim.setValue(1)
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleGuess = () => {
    const trimmed = guess.trim()
    const numericGuess = Number.parseInt(trimmed, 10)

    if (!trimmed || Number.isNaN(numericGuess) || numericGuess < range.min || numericGuess > range.max) {
      setLastResult('invalid')
      setMessage(`Enter a whole number between ${range.min} and ${range.max}.`)
      animateFeedback(false)
      return
    }

    const nextAttempts = attempts + 1
    let nextResult = 'idle'
    let nextMessage = ''

    if (numericGuess === targetNumber) {
      nextResult = 'win'
      nextMessage = `Locked in. You found ${targetNumber} in ${nextAttempts} tries.`
      setGameWon(true)
      storage.updateGameStats('numberguesser', {
        gamesPlayed: 1,
        gamesWon: 1,
        minAttempts: nextAttempts,
      })
    } else if (numericGuess < targetNumber) {
      nextResult = 'low'
      nextMessage = `${numericGuess} is too low. Push higher.`
    } else {
      nextResult = 'high'
      nextMessage = `${numericGuess} is too high. Come down a bit.`
    }

    setAttempts(nextAttempts)
    setGuessHistory((entries) => [
      {
        attempt: nextAttempts,
        guess: numericGuess,
        result: nextResult,
      },
      ...entries,
    ])
    setLastResult(nextResult)
    setMessage(nextMessage)
    setGuess('')
    animateFeedback(nextResult === 'win')
  }

  const handleRangeChange = (nextRange) => {
    setRange(nextRange)
    startNewGame(nextRange)
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.bg }]} contentContainerStyle={styles.content}>
      <Animated.View style={[styles.contentWrap, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={gradients.numberGuesser}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBorder}
        >
          <View style={[styles.heroInner, heroSurfaceStyle]}>
            <View style={styles.headerRow}>
              <GradientButton
                gradient={gradients.numberGuesser}
                label="Back"
                onPress={onBack}
                style={styles.headerButton}
              />
              <GradientButton
                gradient={[designColors.NeonAmber, '#7C2D12']}
                label="New"
                onPress={() => startNewGame()}
                style={styles.headerButton}
              />
            </View>

            <NeonText color={designColors.NeonCyan} size={30} style={styles.heroTitle}>
              Number Guesser
            </NeonText>
            <Text style={[styles.heroCopy, textPrimaryStyle]}>
              Narrow the range, read the hints, and land the target in as few attempts as possible.
            </Text>

            <GlassCard style={[styles.targetCard, targetCardStyle]} colors={themeColors}>
              <Text style={[styles.targetLabel, textSecondaryStyle]}>Current Range</Text>
              <Text style={[styles.targetValue, textPrimaryStyle]}>{range.min} to {range.max}</Text>
              <Text style={[styles.targetHint, textSecondaryStyle]}>Perfect play solves this in about {getIdealGuessCount(range)} guesses.</Text>
            </GlassCard>
          </View>
        </LinearGradient>

        <GlassCard style={styles.difficultyCard} colors={themeColors}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, textPrimaryStyle]}>Difficulty</Text>
            <Text style={[styles.sectionMeta, textSecondaryStyle]}>Choose a search space</Text>
          </View>
          <View style={styles.difficultyStack}>
            {DIFFICULTIES.map((item) => {
              const active = getDifficultyKey(item) === getDifficultyKey(range)
              return (
                <GradientButton
                  key={getDifficultyKey(item)}
                  gradient={active ? gradients.numberGuesser : isLight ? ['rgba(255,255,255,0.96)', 'rgba(224,242,254,0.92)'] : ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
                  label={`${item.label} · ${item.caption}`}
                  onPress={() => handleRangeChange(item)}
                  style={styles.difficultyButton}
                />
              )
            })}
          </View>
        </GlassCard>

        <View style={styles.metricsRow}>
          <GlassCard style={styles.metricCard} colors={themeColors}>
            <Text style={[styles.metricLabel, textSecondaryStyle]}>Attempts</Text>
            <Text style={[styles.metricValue, textPrimaryStyle]}>{attempts}</Text>
          </GlassCard>
          <GlassCard style={styles.metricCard} colors={themeColors}>
            <Text style={[styles.metricLabel, textSecondaryStyle]}>Hint Window</Text>
            <Text style={[styles.metricValueSmall, textPrimaryStyle]}>{hintRange.min} to {hintRange.max}</Text>
          </GlassCard>
          <GlassCard style={styles.metricCard} colors={themeColors}>
            <Text style={[styles.metricLabel, textSecondaryStyle]}>Last Guess</Text>
            <Text style={[styles.metricValueSmall, textPrimaryStyle]}>{guessHistory[0] ? guessHistory[0].guess : '—'}</Text>
          </GlassCard>
        </View>

        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          <GlassCard style={styles.messageCard} colors={themeColors}>
            <Text style={[styles.messageEyebrow, { color: getMessageTone(lastResult, gameWon, themeColors) }]}>
              {gameWon ? 'Solved' : lastResult === 'high' ? 'Too High' : lastResult === 'low' ? 'Too Low' : lastResult === 'invalid' ? 'Invalid Guess' : 'Status'}
            </Text>
            <Text style={[styles.messageText, textPrimaryStyle]}>{message}</Text>
          </GlassCard>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <GlassCard style={[styles.inputCard, gameWon && styles.inputCardWon]} colors={themeColors}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, textPrimaryStyle]}>{gameWon ? 'Play Again' : 'Make a Guess'}</Text>
              <Text style={[styles.sectionMeta, textSecondaryStyle]}>{gameWon ? 'Start a fresh round' : `Enter ${range.min}–${range.max}`}</Text>
            </View>

            {!gameWon && (
              <TextInput
                style={[styles.input, textPrimaryStyle, inputSurfaceStyle]}
                value={guess}
                onChangeText={setGuess}
                placeholder="Type your guess"
                placeholderTextColor={themeColors.textSecondary}
                keyboardType="number-pad"
                returnKeyType="done"
                maxLength={3}
                onSubmitEditing={handleGuess}
              />
            )}

            <View style={styles.actionRow}>
              {!gameWon && (
                <GradientButton
                  gradient={gradients.numberGuesser}
                  label="Submit Guess"
                  onPress={handleGuess}
                  disabled={!guess.trim()}
                  style={styles.primaryAction}
                />
              )}
              <GradientButton
                gradient={[designColors.NeonAmber, '#7C2D12']}
                label={gameWon ? 'Start New Round' : 'Reset Round'}
                onPress={() => startNewGame()}
                style={styles.secondaryAction}
              />
            </View>
          </GlassCard>
        </Animated.View>

        <GlassCard style={styles.historyCard} colors={themeColors}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, textPrimaryStyle]}>Guess History</Text>
            <Text style={[styles.sectionMeta, textSecondaryStyle]}>{guessHistory.length ? 'Latest guess first' : 'No guesses yet'}</Text>
          </View>

          {guessHistory.length === 0 ? (
            <Text style={[styles.emptyState, textSecondaryStyle]}>Your guesses will appear here with directional feedback.</Text>
          ) : (
            <View style={styles.historyList}>
              {guessHistory.map((item) => (
                <View key={item.attempt} style={[styles.historyRow, historyRowStyle]}>
                  <View>
                    <Text style={[styles.historyAttempt, textSecondaryStyle]}>Attempt {item.attempt}</Text>
                    <Text style={[styles.historyGuess, textPrimaryStyle]}>{item.guess}</Text>
                  </View>
                  <Text
                    style={[
                      styles.historyResult,
                      {
                        color:
                          item.result === 'win'
                            ? designColors.Success
                            : item.result === 'low'
                              ? designColors.NeonCyan
                              : designColors.Danger,
                      },
                    ]}
                  >
                    {item.result === 'win' ? 'Correct' : item.result === 'low' ? 'Go Higher' : 'Go Lower'}
                  </Text>
                </View>
              ))}
            </View>
          )}
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
  heroBorder: {
    borderRadius: spacing.xl,
    padding: 2,
  },
  heroInner: {
    borderRadius: spacing.xl - 2,
    padding: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  headerButton: {
    minWidth: 88,
  },
  heroTitle: {
    textAlign: 'left',
    marginBottom: spacing.sm,
  },
  heroCopy: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.body,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  targetCard: {
  },
  targetLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  targetValue: {
    fontSize: 40,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  targetHint: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    lineHeight: 20,
  },
  difficultyCard: {
    paddingVertical: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
  },
  sectionMeta: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
  },
  difficultyStack: {
    gap: spacing.sm,
  },
  difficultyButton: {
    minHeight: 50,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  metricLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
  },
  metricValueSmall: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  messageCard: {
    paddingVertical: spacing.lg,
  },
  messageEyebrow: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  messageText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputCard: {
    paddingVertical: spacing.lg,
    ...shadows.neonGlow,
  },
  inputCardWon: {
    borderColor: designColors.Success,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  input: {
    fontSize: 32,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    textAlign: 'center',
    borderRadius: spacing.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
    minHeight: 72,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  primaryAction: {
    flex: 1,
  },
  secondaryAction: {
    flex: 1,
  },
  historyCard: {
    paddingVertical: spacing.lg,
  },
  emptyState: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    lineHeight: 20,
  },
  historyList: {
    gap: spacing.sm,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.md,
    borderWidth: 1,
  },
  historyAttempt: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    marginBottom: 2,
  },
  historyGuess: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
  },
  historyResult: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    textAlign: 'right',
  },
})
