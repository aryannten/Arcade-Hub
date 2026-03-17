import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { storage } from '../utils/storage'

export default function NumberGuesser({ onBack, colors }) {
  const [targetNumber, setTargetNumber] = useState(0)
  const [guess, setGuess] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [message, setMessage] = useState('')
  const [gameWon, setGameWon] = useState(false)
  const [range, setRange] = useState({ min: 1, max: 100 })
  const [guessHistory, setGuessHistory] = useState([])

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
  }, [])

  const handleGuess = () => {
    const numGuess = parseInt(guess, 10)
    if (isNaN(numGuess) || numGuess < range.min || numGuess > range.max) {
      setMessage(`Please enter a valid number between ${range.min} and ${range.max}`)
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
    } else if (numGuess < targetNumber) {
      setMessage('Too low! Try a higher number.')
    } else {
      setMessage('Too high! Try a lower number.')
    }
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
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={[styles.btn, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.btnText, { color: colors.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Number Guesser</Text>
        <TouchableOpacity onPress={startNewGame} style={[styles.btn, { backgroundColor: colors.primary }]}>
          <Text style={styles.btnTextLight}>New Game</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.diff}>
        <Text style={[styles.label, { color: colors.text }]}>Difficulty:</Text>
        <View style={styles.diffRow}>
          {[
            { min: 1, max: 10, label: 'Easy (1-10)' },
            { min: 1, max: 50, label: 'Medium (1-50)' },
            { min: 1, max: 100, label: 'Hard (1-100)' },
          ].map((r) => (
            <TouchableOpacity
              key={r.max}
              onPress={() => handleRangeChange(r)}
              style={[
                styles.diffBtn,
                { borderColor: colors.border },
                range.max === r.max && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
            >
              <Text style={[styles.diffBtnText, { color: colors.text }]}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.info, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <Text style={[styles.infoText, { color: colors.text }]}>Range: {range.min} – {range.max}</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>Attempts: {attempts}</Text>
      </View>

      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>

      {!gameWon && (
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.cardBg, borderColor: colors.border, color: colors.text }]}
            value={guess}
            onChangeText={setGuess}
            placeholder="Your guess"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
          />
          <TouchableOpacity
            onPress={handleGuess}
            disabled={!guess.trim()}
            style={[styles.guessBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.btnTextLight}>Guess!</Text>
          </TouchableOpacity>
        </View>
      )}

      {guessHistory.length > 0 && (
        <View style={[styles.history, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.historyTitle, { color: colors.text }]}>Your guesses:</Text>
          <View style={styles.historyList}>
            {guessHistory.map((item, i) => (
              <Text key={i} style={[styles.historyItem, { color: colors.textSecondary }]}>{item.guess}</Text>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  btnText: { fontWeight: '600' },
  btnTextLight: { color: '#fff', fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700' },
  diff: { marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 8, fontWeight: '600' },
  diffRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  diffBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  diffBtnText: { fontSize: 13 },
  info: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 16 },
  infoText: { fontSize: 14 },
  message: { fontSize: 16, marginBottom: 16, textAlign: 'center' },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  guessBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, justifyContent: 'center' },
  history: { padding: 12, borderRadius: 10, borderWidth: 1 },
  historyTitle: { fontWeight: '600', marginBottom: 8 },
  historyList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  historyItem: { fontSize: 14 },
})
