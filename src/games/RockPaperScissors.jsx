import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { storage } from '../utils/storage'

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


  const getRandom = () => CHOICES[Math.floor(Math.random() * CHOICES.length)]

  const play = (choice) => {
    if (isPlaying) return
    setIsPlaying(true)
    setPlayerChoice(choice)
    setComputerChoice(null)
    setResult('')
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
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={[styles.btn, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.btnText, { color: colors.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Rock Paper Scissors</Text>
        <TouchableOpacity onPress={reset} style={[styles.btn, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.btnText, { color: colors.text }]}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.scoreboard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>You</Text>
          <Text style={[styles.scoreVal, { color: colors.text }]}>{playerScore}</Text>
        </View>
        <Text style={[styles.vs, { color: colors.textSecondary }]}>VS</Text>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Computer</Text>
          <Text style={[styles.scoreVal, { color: colors.text }]}>{computerScore}</Text>
        </View>
      </View>

      <View style={[styles.arena, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={styles.choicesRow}>
          <View style={styles.choiceBox}>
            <Text style={[styles.choiceLabel, { color: colors.textSecondary }]}>You</Text>
            <Text style={styles.emojiBig}>{playerChoice ? playerChoice.emoji : '❓'}</Text>
          </View>
          <View style={styles.choiceBox}>
            <Text style={[styles.choiceLabel, { color: colors.textSecondary }]}>Computer</Text>
            <Text style={styles.emojiBig}>{isPlaying ? '🤔' : computerChoice ? computerChoice.emoji : '❓'}</Text>
          </View>
        </View>
        {result ? (
          <Text style={[
            styles.result,
            { color: result.includes('You') ? colors.success : result.includes('Computer') ? colors.error : colors.text },
          ]}>
            {result}
          </Text>
        ) : null}
      </View>

      <Text style={[styles.pick, { color: colors.text }]}>Pick one:</Text>
      <View style={styles.weapons}>
        {CHOICES.map((c) => (
          <TouchableOpacity
            key={c.name}
            onPress={() => play(c)}
            disabled={isPlaying}
            style={[styles.weaponBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
          >
            <Text style={styles.weaponEmoji}>{c.emoji}</Text>
            <Text style={[styles.weaponName, { color: colors.text }]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {gameHistory.length > 0 && (
        <View style={[styles.history, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.historyTitle, { color: colors.text }]}>Last games</Text>
          {gameHistory.slice(-5).reverse().map((g, i) => (
            <View key={i} style={styles.historyRow}>
              <Text style={[styles.historyText, { color: colors.text }]}>{g.player.emoji} vs {g.computer.emoji}</Text>
              <Text style={[styles.historyRes, { color: g.result.includes('You') ? colors.success : g.result.includes('Computer') ? colors.error : colors.textSecondary }]}>
                {g.result}
              </Text>
            </View>
          ))}
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
  title: { fontSize: 18, fontWeight: '700' },
  scoreboard: { flexDirection: 'row', justifyContent: 'space-around', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  scoreItem: { alignItems: 'center' },
  scoreLabel: { fontSize: 12, marginBottom: 4 },
  scoreVal: { fontSize: 24, fontWeight: '700' },
  vs: { fontSize: 14, alignSelf: 'center' },
  arena: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  choicesRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  choiceBox: { alignItems: 'center' },
  choiceLabel: { fontSize: 12, marginBottom: 4 },
  emojiBig: { fontSize: 48 },
  result: { textAlign: 'center', fontSize: 16, fontWeight: '600' },
  pick: { fontWeight: '600', marginBottom: 10 },
  weapons: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 20 },
  weaponBtn: { padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center', minWidth: 90 },
  weaponEmoji: { fontSize: 36, marginBottom: 4 },
  weaponName: { fontSize: 13 },
  history: { padding: 12, borderRadius: 12, borderWidth: 1 },
  historyTitle: { fontWeight: '600', marginBottom: 8 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  historyText: { fontSize: 14 },
  historyRes: { fontSize: 14 },
})
