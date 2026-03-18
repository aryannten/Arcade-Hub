import { useState, useEffect, useRef } from 'react'
import { View, Text, TextInput, StyleSheet, ScrollView, Animated } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { storage } from '../utils/storage'
import { colors as designColors, gradients, spacing, typography, shadows } from '../design/tokens'
import GlassCard from '../design/components/GlassCard'
import GradientButton from '../design/components/GradientButton'
import StatBar from '../design/components/StatBar'

export default function NumberGuesser({ onBack, colors }) {
  const [targetNumber, setTargetNumber] = useState(0)
  const [guess, setGuess] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [message, setMessage] = useState('')
  const [gameWon, setGameWon] = useState(false)
  const [range, setRange] = useState({ min: 1, max: 100 })
  const [guessHistory, setGuessHistory] = useState([])
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(-20)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  const startNewGame = () => {
    const newTarget = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
    setTargetNumber(newTarget)
    setGuess('')
    setAttempts(0)
    setMessage(`Guess a number between ${range.min} and ${range.max}!`)
    setGameWon(false)
    setGuessHistory([])
  }

  useEffect(() => {
    startNewGame()
    // Entry animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start()
  }, [])

  const handleGuess = () => {
    const numGuess = parseInt(guess, 10)
    if (isNaN(numGuess) || numGuess < range.min || numGuess > range.max) {
      setMessage(`Please enter a valid number between ${range.min} and ${range.max}`)
      // Feedback slide-in animation
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        })
      ]).start()
      return
    }
    const newAttempts = attempts + 1
    setAttempts(newAttempts)
    setGuessHistory((prev) => [...prev, { guess: numGuess, attempt: newAttempts }])

    if (numGuess === targetNumber) {
      setMessage(`🎉 You got it in ${newAttempts} attempts!`)
      setGameWon(true)
      storage.updateGameStats('numberguesser', {
        gamesPlayed: 1,
        gamesWon: 1,
        minAttempts: newAttempts,
      })
      // Success pulse animation
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
    } else if (numGuess < targetNumber) {
      setMessage('Too low! Try a higher number.')
    } else {
      setMessage('Too high! Try a lower number.')
    }
    
    // Feedback slide-in animation
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 0,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start()
    
    setGuess('')
  }

  const handleRangeChange = (newRange) => {
    setRange(newRange)
    const newTarget = Math.floor(Math.random() * (newRange.max - newRange.min + 1)) + newRange.min
    setTargetNumber(newTarget)
    setGuess('')
    setAttempts(0)
    setMessage(`Guess a number between ${newRange.min} and ${newRange.max}!`)
    setGameWon(false)
    setGuessHistory([])
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Header with gradient accent */}
        <LinearGradient
          colors={gradients.numberGuesser}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <GradientButton
              gradient={gradients.numberGuesser}
              label="← Back"
              onPress={onBack}
              style={styles.backButton}
            />
            <Text style={styles.title}>Number Guesser</Text>
            <GradientButton
              gradient={gradients.numberGuesser}
              label="New Game"
              onPress={startNewGame}
              style={styles.restartButton}
            />
          </View>
        </LinearGradient>

        {/* Difficulty selector */}
        <GlassCard style={styles.diffCard}>
          <Text style={styles.diffLabel}>Difficulty:</Text>
          <View style={styles.diffRow}>
            {[
              { min: 1, max: 10, label: 'Easy (1-10)' },
              { min: 1, max: 50, label: 'Medium (1-50)' },
              { min: 1, max: 100, label: 'Hard (1-100)' },
            ].map((r) => (
              <GradientButton
                key={r.max}
                gradient={range.max === r.max ? gradients.numberGuesser : [designColors.Surface, designColors.Surface]}
                label={r.label}
                onPress={() => handleRangeChange(r)}
                style={styles.diffBtn}
              />
            ))}
          </View>
        </GlassCard>

        {/* Stats with StatBar component */}
        <GlassCard style={styles.statsCard}>
          <StatBar
            label="Attempts"
            value={attempts}
            color={designColors.NeonCyan}
          />
        </GlassCard>

        {/* Feedback message with slide-in animation */}
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          <GlassCard style={styles.messageCard}>
            <Text style={styles.message}>{message}</Text>
          </GlassCard>
        </Animated.View>

        {/* Win message with pulse animation */}
        {gameWon && (
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <GlassCard style={[styles.winCard, shadows.neonGlow]}>
              <Text style={styles.winText}>🎉 You got it in {attempts} attempts!</Text>
            </GlassCard>
          </Animated.View>
        )}

        {/* Input field with glassmorphism styling */}
        {!gameWon && (
          <GlassCard style={styles.inputCard}>
            <TextInput
              style={styles.input}
              value={guess}
              onChangeText={setGuess}
              placeholder="Your guess"
              placeholderTextColor={designColors.TextMuted}
              keyboardType="number-pad"
            />
            <GradientButton
              gradient={gradients.numberGuesser}
              label="Guess!"
              onPress={handleGuess}
              disabled={!guess.trim()}
              style={styles.guessBtn}
            />
          </GlassCard>
        )}

        {/* Guess history */}
        {guessHistory.length > 0 && (
          <GlassCard style={styles.history}>
            <Text style={styles.historyTitle}>Your guesses:</Text>
            <View style={styles.historyList}>
              {guessHistory.map((item, i) => (
                <View key={i} style={styles.historyItem}>
                  <Text style={styles.historyItemText}>{item.guess}</Text>
                </View>
              ))}
            </View>
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
  restartButton: {
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
  diffCard: {
    marginBottom: spacing.md
  },
  diffLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: designColors.TextMuted,
    marginBottom: spacing.sm
  },
  diffRow: {
    gap: spacing.sm
  },
  diffBtn: {
    minHeight: 44
  },
  statsCard: {
    marginBottom: spacing.md
  },
  messageCard: {
    marginBottom: spacing.md
  },
  message: {
    textAlign: 'center',
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.body,
    color: designColors.TextPrimary
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
    fontWeight: 'bold',
    color: designColors.TextPrimary
  },
  inputCard: {
    marginBottom: spacing.md
  },
  input: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.body,
    color: designColors.TextPrimary,
    backgroundColor: designColors.Surface,
    borderWidth: 1,
    borderColor: designColors.SurfaceBorder,
    borderRadius: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    minHeight: 48
  },
  guessBtn: {
    minHeight: 48
  },
  history: {
    marginTop: spacing.md
  },
  historyTitle: {
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    fontSize: typography.fontSize.sm,
    color: designColors.TextPrimary,
    marginBottom: spacing.sm
  },
  historyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  historyItem: {
    backgroundColor: designColors.Surface,
    borderWidth: 1,
    borderColor: designColors.SurfaceBorder,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 32,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  historyItemText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: designColors.TextMuted
  }
})
