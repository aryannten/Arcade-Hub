import React, { useEffect, useRef, useState } from 'react'
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { storage } from '../utils/storage'
import { soundManager } from '../utils/sounds'
import { colors as designColors, gradients, spacing, typography, shadows } from '../design/tokens'
import GlassCard from '../design/components/GlassCard'
import GradientButton from '../design/components/GradientButton'
import NeonText from '../design/components/NeonText'
import { resolveThemeColors } from '../utils/theme'

export const CHOICES = [
  { name: 'rock', label: 'Rock', emoji: '🪨', beats: 'scissors' },
  { name: 'paper', label: 'Paper', emoji: '📄', beats: 'rock' },
  { name: 'scissors', label: 'Scissors', emoji: '✂️', beats: 'paper' },
]

const CHOICE_MAP = CHOICES.reduce((map, choice) => {
  map[choice.name] = choice
  return map
}, {})

const ROUND_DELAY_MS = 520
const HISTORY_LIMIT = 6

function getResultTone(result) {
  if (result === 'win') return designColors.Success
  if (result === 'loss') return designColors.Danger
  return designColors.NeonAmber
}

export function getRoundOutcome(playerChoiceName, computerChoiceName) {
  if (!playerChoiceName || !computerChoiceName) return 'pending'
  if (playerChoiceName === computerChoiceName) return 'tie'

  const playerChoice = CHOICE_MAP[playerChoiceName]
  return playerChoice.beats === computerChoiceName ? 'win' : 'loss'
}

export function getRoundMessage(result) {
  if (result === 'win') return 'You take the round'
  if (result === 'loss') return 'Computer takes the round'
  if (result === 'tie') return 'Round ends in a tie'
  return 'Choose your move'
}

export function resolveRound(playerChoiceName, computerChoiceName) {
  const result = getRoundOutcome(playerChoiceName, computerChoiceName)

  return {
    playerChoice: CHOICE_MAP[playerChoiceName] ?? null,
    computerChoice: CHOICE_MAP[computerChoiceName] ?? null,
    result,
    message: getRoundMessage(result),
  }
}

function getRandomChoice() {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)]
}

function getHistorySummary(round) {
  if (round.result === 'win') return 'You won'
  if (round.result === 'loss') return 'Computer won'
  return 'Tie round'
}

export default function RockPaperScissors({ onBack, colors }) {
  const themeColors = resolveThemeColors(colors)
  const isLight = themeColors.name === 'light'
  const textPrimaryStyle = { color: themeColors.text }
  const textSecondaryStyle = { color: themeColors.textSecondary }
  const headerSurfaceStyle = { backgroundColor: isLight ? 'rgba(255,255,255,0.94)' : '#120D08' }
  const dividerStyle = { backgroundColor: isLight ? themeColors.border : 'rgba(255,255,255,0.08)' }
  const throwCardSurfaceStyle = {
    borderColor: isLight ? themeColors.border : 'rgba(255,255,255,0.08)',
    backgroundColor: isLight ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.04)',
  }
  const choiceCardSurfaceStyle = {
    borderColor: isLight ? themeColors.border : 'rgba(255,255,255,0.08)',
  }
  const historyRowBorderStyle = { borderTopColor: isLight ? themeColors.border : 'rgba(255,255,255,0.06)' }
  const [playerChoice, setPlayerChoice] = useState(null)
  const [computerChoice, setComputerChoice] = useState(null)
  const [result, setResult] = useState('pending')
  const [status, setStatus] = useState('Choose your move')
  const [roundNumber, setRoundNumber] = useState(0)
  const [playerScore, setPlayerScore] = useState(0)
  const [computerScore, setComputerScore] = useState(0)
  const [ties, setTies] = useState(0)
  const [playerStreak, setPlayerStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [history, setHistory] = useState([])
  const [isResolving, setIsResolving] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const statusAnim = useRef(new Animated.Value(1)).current
  const resultPulseAnim = useRef(new Animated.Value(1)).current
  const choiceScaleAnims = useRef(CHOICES.map(() => new Animated.Value(1))).current
  const timerRef = useRef(null)

  useEffect(() => {
    fadeAnim.setValue(0)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start()
  }, [fadeAnim])

  useEffect(() => {
    if (!isResolving && result === 'pending') {
      statusAnim.setValue(1)
      return
    }

    statusAnim.setValue(0)
    Animated.timing(statusAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start()
  }, [isResolving, result, statusAnim])

  useEffect(() => {
    if (result === 'pending') {
      resultPulseAnim.setValue(1)
      return
    }

    Animated.sequence([
      Animated.timing(resultPulseAnim, {
        toValue: 1.05,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(resultPulseAnim, {
        toValue: 1,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start()
  }, [result, resultPulseAnim])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const resetRoundView = () => {
    setPlayerChoice(null)
    setComputerChoice(null)
    setResult('pending')
    setStatus('Choose your move')
    setIsResolving(false)
  }

  const resetAll = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    soundManager.playClick()
    resetRoundView()
    setRoundNumber(0)
    setPlayerScore(0)
    setComputerScore(0)
    setTies(0)
    setPlayerStreak(0)
    setBestStreak(0)
    setHistory([])
  }

  const playRound = (choice, index) => {
    if (isResolving) return

    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    soundManager.playMove()
    setIsResolving(true)
    setPlayerChoice(choice)
    setComputerChoice(null)
    setResult('pending')
    setStatus('Computer is choosing...')
    resultPulseAnim.setValue(1)

    Animated.sequence([
      Animated.timing(choiceScaleAnims[index], {
        toValue: 0.94,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(choiceScaleAnims[index], {
        toValue: 1,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start()

    timerRef.current = setTimeout(() => {
      const computer = getRandomChoice()
      const round = resolveRound(choice.name, computer.name)
      const nextRoundNumber = roundNumber + 1
      const nextPlayerScore = round.result === 'win' ? playerScore + 1 : playerScore
      const nextComputerScore = round.result === 'loss' ? computerScore + 1 : computerScore
      const nextTies = round.result === 'tie' ? ties + 1 : ties
      const nextPlayerStreak = round.result === 'win' ? playerStreak + 1 : 0
      const nextBestStreak = Math.max(bestStreak, nextPlayerStreak)

      setRoundNumber(nextRoundNumber)
      setComputerChoice(round.computerChoice)
      setResult(round.result)
      setStatus(round.message)
      setPlayerScore(nextPlayerScore)
      setComputerScore(nextComputerScore)
      setTies(nextTies)
      setPlayerStreak(nextPlayerStreak)
      setBestStreak(nextBestStreak)
      setHistory((entries) => [
        {
          id: nextRoundNumber,
          playerChoice: round.playerChoice,
          computerChoice: round.computerChoice,
          result: round.result,
          message: round.message,
        },
        ...entries,
      ].slice(0, HISTORY_LIMIT))
      setIsResolving(false)

      if (round.result === 'win') soundManager.playSuccess()
      else if (round.result === 'loss') soundManager.playError()
      else soundManager.playClick()

      storage.updateGameStats('rockpaperscissors', {
        gamesPlayed: 1,
        gamesWon: round.result === 'win' ? 1 : 0,
        ...(round.result === 'win' ? { bestScore: nextBestStreak } : {}),
      })
    }, ROUND_DELAY_MS)
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.bg }]} contentContainerStyle={styles.content}>
      <Animated.View style={[styles.contentWrap, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={gradients.rockPaperScissors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={[styles.headerCard, headerSurfaceStyle]}>
            <GradientButton
              gradient={gradients.rockPaperScissors}
              label="Back"
              onPress={onBack}
              style={styles.backButton}
            />
            <View style={styles.headerCopy}>
              <Text style={[styles.title, textPrimaryStyle]}>Rock Paper Scissors</Text>
              <Text style={[styles.headerSubtitle, textSecondaryStyle]}>Fast rounds with clearer feedback and proper score tracking.</Text>
            </View>
            <GradientButton
              gradient={[designColors.NeonAmber, '#92400E']}
              label="Reset"
              onPress={resetAll}
              style={styles.resetButton}
            />
          </View>
        </LinearGradient>

        <GlassCard style={styles.scoreboardCard} colors={themeColors}>
          <View style={styles.scoreCell}>
            <Text style={[styles.scoreLabel, textSecondaryStyle]}>You</Text>
            <Text testID="score-player" style={[styles.scoreValue, { color: designColors.Success }]}>{playerScore}</Text>
          </View>
          <View style={[styles.scoreDivider, dividerStyle]} />
          <View style={styles.scoreCell}>
            <Text style={[styles.scoreLabel, textSecondaryStyle]}>Ties</Text>
            <Text testID="score-ties" style={[styles.scoreValue, { color: designColors.NeonAmber }]}>{ties}</Text>
          </View>
          <View style={[styles.scoreDivider, dividerStyle]} />
          <View style={styles.scoreCell}>
            <Text style={[styles.scoreLabel, textSecondaryStyle]}>Computer</Text>
            <Text testID="score-computer" style={[styles.scoreValue, { color: designColors.Danger }]}>{computerScore}</Text>
          </View>
        </GlassCard>

        <View style={styles.statsRow}>
          <GlassCard style={styles.metricCard} colors={themeColors}>
            <Text style={[styles.metricLabel, textSecondaryStyle]}>Current Streak</Text>
            <Text testID="streak-current" style={[styles.metricValue, { color: designColors.Success }]}>{playerStreak}</Text>
          </GlassCard>
          <GlassCard style={styles.metricCard} colors={themeColors}>
            <Text style={[styles.metricLabel, textSecondaryStyle]}>Best Streak</Text>
            <Text testID="streak-best" style={[styles.metricValue, { color: designColors.NeonAmber }]}>{bestStreak}</Text>
          </GlassCard>
          <GlassCard style={styles.metricCard} colors={themeColors}>
            <Text style={[styles.metricLabel, textSecondaryStyle]}>Rounds</Text>
            <Text testID="round-count" style={[styles.metricValue, textPrimaryStyle]}>{roundNumber}</Text>
          </GlassCard>
        </View>

        <GlassCard style={styles.arenaCard} colors={themeColors}>
          <View style={styles.arenaHeader}>
            <Text style={[styles.arenaEyebrow, textSecondaryStyle]}>Round Arena</Text>
            <Animated.View style={{ opacity: statusAnim, transform: [{ scale: resultPulseAnim }] }}>
              <NeonText
                color={getResultTone(result)}
                size={22}
                style={styles.statusText}
                testID="status-text"
              >
                {status}
              </NeonText>
            </Animated.View>
          </View>

          <View style={styles.throwRow}>
            <View style={[styles.throwCard, throwCardSurfaceStyle]}>
              <Text style={[styles.throwLabel, textSecondaryStyle]}>You</Text>
              <Text testID="player-choice" style={styles.throwEmoji}>{playerChoice ? playerChoice.emoji : '—'}</Text>
              <Text style={[styles.throwName, textPrimaryStyle]}>{playerChoice ? playerChoice.label : 'Waiting'}</Text>
            </View>

            <View style={styles.versusBadge}>
              <Text style={styles.versusText}>VS</Text>
            </View>

            <View style={[styles.throwCard, throwCardSurfaceStyle]}>
              <Text style={[styles.throwLabel, textSecondaryStyle]}>Computer</Text>
              <Text testID="computer-choice" style={styles.throwEmoji}>
                {isResolving ? '…' : computerChoice ? computerChoice.emoji : '—'}
              </Text>
              <Text style={[styles.throwName, textPrimaryStyle]}>
                {isResolving ? 'Thinking' : computerChoice ? computerChoice.label : 'Waiting'}
              </Text>
            </View>
          </View>
        </GlassCard>

        <View style={styles.choicesWrap}>
          <Text style={[styles.sectionLabel, textPrimaryStyle]}>Pick your move</Text>
          <View style={styles.choicesGrid}>
            {CHOICES.map((choice, index) => {
              const isSelected = playerChoice?.name === choice.name
              return (
                <TouchableOpacity
                  key={choice.name}
                  testID={`choice-${choice.name}`}
                  activeOpacity={0.9}
                  disabled={isResolving}
                  onPress={() => playRound(choice, index)}
                  style={styles.choiceTouchable}
                >
                  <Animated.View style={{ transform: [{ scale: choiceScaleAnims[index] }] }}>
                    <GlassCard style={[styles.choiceCard, choiceCardSurfaceStyle, isSelected && styles.choiceCardSelected, isResolving && styles.choiceCardDisabled]} colors={themeColors}>
                      <Text style={styles.choiceEmoji}>{choice.emoji}</Text>
                      <Text style={[styles.choiceTitle, textPrimaryStyle]}>{choice.label}</Text>
                      <Text style={[styles.choiceHint, textSecondaryStyle]}>Beats {CHOICE_MAP[choice.beats].label.toLowerCase()}</Text>
                    </GlassCard>
                  </Animated.View>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        <GlassCard style={styles.historyCard} colors={themeColors}>
          <View style={styles.historyHeader}>
            <Text style={[styles.historyTitle, textPrimaryStyle]}>Recent Rounds</Text>
            <Text style={[styles.historyCaption, textSecondaryStyle]}>Most recent first</Text>
          </View>

          {history.length === 0 ? (
            <Text style={[styles.emptyHistory, textSecondaryStyle]}>No rounds yet. Throw a move to start the match.</Text>
          ) : (
            history.map((round) => (
              <View key={round.id} style={[styles.historyRow, historyRowBorderStyle]}>
                <View>
                  <Text style={[styles.historyRound, textSecondaryStyle]}>Round {round.id}</Text>
                  <Text style={[styles.historyMoves, textPrimaryStyle]}>
                    {round.playerChoice.emoji} {round.playerChoice.label} vs {round.computerChoice.emoji} {round.computerChoice.label}
                  </Text>
                </View>
                <Text style={[styles.historyResult, { color: getResultTone(round.result) }]}>
                  {getHistorySummary(round)}
                </Text>
              </View>
            ))
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
  statsRow: {
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
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  metricValue: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
  },
  arenaCard: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  arenaHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  arenaEyebrow: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  statusText: {
    textAlign: 'center',
  },
  throwRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  throwCard: {
    flex: 1,
    minHeight: 150,
    borderRadius: spacing.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  throwLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    marginBottom: spacing.sm,
  },
  throwEmoji: {
    fontSize: 50,
    marginBottom: spacing.sm,
  },
  throwName: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
  },
  versusBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(249, 115, 22, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  versusText: {
    color: designColors.NeonAmber,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
  },
  choicesWrap: {
    marginTop: spacing.xs,
  },
  sectionLabel: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  choicesGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  choiceTouchable: {
    flex: 1,
    minWidth: 80,
  },
  choiceCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  choiceCardSelected: {
    borderColor: 'rgba(245, 158, 11, 0.5)',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    ...shadows.neonGlowAmber,
  },
  choiceCardDisabled: {
    opacity: 0.82,
  },
  choiceEmoji: {
    fontSize: 38,
    marginBottom: spacing.sm,
  },
  choiceTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  choiceHint: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    textAlign: 'center',
  },
  historyCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  historyTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
  },
  historyCaption: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
  },
  emptyHistory: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    lineHeight: 20,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
  },
  historyRound: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    marginBottom: 2,
  },
  historyMoves: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
  },
  historyResult: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    textAlign: 'right',
  },
})
