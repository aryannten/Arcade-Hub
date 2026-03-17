import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { storage } from '../utils/storage'

const DIFF = { easy: { pairs: 6, cols: 3 }, medium: { pairs: 8, cols: 4 }, hard: { pairs: 12, cols: 4 } }
const EMOJIS = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎺', '🎸', '🎹', '🎤', '🎧', '🎬']

export default function MemoryGame({ onBack, colors }) {
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [difficulty, setDifficulty] = useState('easy')
  const [timer, setTimer] = useState(0)
  const timerRef = useRef(null)

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
    }
  }, [matched.length, cards.length, moves])

  const tap = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return
    setFlipped((f) => [...f, id])
  }

  const visible = (id) => flipped.includes(id) || matched.includes(id)
  const { pairs, cols } = DIFF[difficulty]

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={[styles.btn, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.btnText, { color: colors.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Memory Match</Text>
        <TouchableOpacity onPress={() => init()} style={[styles.btn, { backgroundColor: colors.primary }]}>
          <Text style={styles.btnTextLight}>Restart</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.diffRow}>
        {Object.keys(DIFF).map((d) => (
          <TouchableOpacity
            key={d}
            onPress={() => setDifficulty(d)}
            style={[styles.diffBtn, { borderColor: colors.border }, difficulty === d && { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.diffBtnText, { color: colors.text }]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.info, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <Text style={[styles.infoText, { color: colors.text }]}>Moves: {moves}</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>Matches: {matched.length / 2} / {pairs}</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>
          Time: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
        </Text>
      </View>

      {gameWon && (
        <View style={[styles.win, { backgroundColor: colors.success + '30', borderColor: colors.success }]}>
          <Text style={[styles.winText, { color: colors.text }]}>🎉 You won in {moves} moves!</Text>
        </View>
      )}

      <View style={[styles.grid, { maxWidth: cols * 76 }]}>
        {cards.map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => tap(c.id)}
            style={[
              styles.card,
              { backgroundColor: visible(c.id) ? colors.primary + '40' : colors.cardBg, borderColor: colors.border },
            ]}
          >
            <Text style={styles.cardEmoji}>{visible(c.id) ? c.emoji : '?'}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  btn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  btnText: { fontWeight: '600' },
  btnTextLight: { color: '#fff', fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700' },
  diffRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  diffBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  diffBtnText: { fontSize: 13 },
  info: { flexDirection: 'row', justifyContent: 'space-around', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 12 },
  infoText: { fontSize: 14 },
  win: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 12 },
  winText: { textAlign: 'center', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignSelf: 'center' },
  card: { width: 68, height: 68, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  cardEmoji: { fontSize: 28 },
})
