import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { storage } from '../utils/storage'
import { soundManager } from '../utils/sounds'

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

  const isDraw = !winner && board.every((c) => c != null)

  useEffect(() => {
    if (isDraw && !winner && !drawRef.current) {
      drawRef.current = true
      setDraws((d) => d + 1)
      storage.updateGameStats('tictactoe', { gamesPlayed: 1, gamesWon: 0 })
    }
    if (winner || !isDraw) drawRef.current = false
  }, [isDraw, winner])

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
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={[styles.btn, { backgroundColor: colors.cardBg }]}>
            <Text style={[styles.btnText, { color: colors.text }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Tic Tac Toe</Text>
          <View style={styles.placeholder} />
        </View>
        <Text style={[styles.subtitle, { color: colors.text }]}>Choose mode</Text>
        <View style={styles.modeRow}>
          <TouchableOpacity
            onPress={() => start('computer')}
            style={[styles.modeBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
          >
            <Text style={styles.modeEmoji}>🤖</Text>
            <Text style={[styles.modeTitle, { color: colors.text }]}>vs Computer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => start('player')}
            style={[styles.modeBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
          >
            <Text style={styles.modeEmoji}>👥</Text>
            <Text style={[styles.modeTitle, { color: colors.text }]}>vs Player</Text>
          </TouchableOpacity>
        </View>
      </View>
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

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.gameContent}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMode('select')} style={[styles.btn, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.btnText, { color: colors.text }]}>← Mode</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          Tic Tac Toe · {mode === 'computer' ? 'vs Computer' : 'vs Player'}
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={newRound} style={[styles.smBtn, { backgroundColor: colors.cardBg }]}>
            <Text style={[styles.btnText, { color: colors.text }]}>New</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={resetScore} style={[styles.smBtn, { backgroundColor: colors.cardBg }]}>
            <Text style={[styles.btnText, { color: colors.text }]}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.scores, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>{mode === 'computer' ? 'You' : 'P1'}</Text>
          <Text style={[styles.scoreVal, { color: colors.text }]}>{xWins}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Draws</Text>
          <Text style={[styles.scoreVal, { color: colors.text }]}>{draws}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>{mode === 'computer' ? 'Computer' : 'P2'}</Text>
          <Text style={[styles.scoreVal, { color: colors.text }]}>{oWins}</Text>
        </View>
      </View>

      <Text style={[styles.status, { color: colors.text }]}>{status}</Text>

      <View style={[styles.board, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        {board.map((cell, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => play(i)}
            disabled={!!cell || !!winner || thinking}
            style={[styles.cell, { borderColor: colors.border }]}
          >
            <Text style={[styles.cellText, { color: colors.text }]}>{cell}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  gameContent: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerRight: { flexDirection: 'row', gap: 8 },
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  smBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnText: { fontWeight: '600' },
  placeholder: { width: 70 },
  title: { fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' },
  subtitle: { fontSize: 16, marginBottom: 16, textAlign: 'center' },
  modeRow: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  modeBtn: { padding: 20, borderRadius: 12, borderWidth: 1, alignItems: 'center', minWidth: 120 },
  modeEmoji: { fontSize: 32, marginBottom: 8 },
  modeTitle: { fontWeight: '600' },
  scores: { flexDirection: 'row', justifyContent: 'space-around', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 12 },
  scoreItem: { alignItems: 'center' },
  scoreLabel: { fontSize: 12, marginBottom: 2 },
  scoreVal: { fontSize: 18, fontWeight: '700' },
  status: { textAlign: 'center', marginBottom: 12, fontSize: 16, fontWeight: '600' },
  board: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, borderRadius: 12, borderWidth: 1, alignSelf: 'center' },
  cell: { width: 92, height: 92, borderWidth: 2, borderRadius: 8, justifyContent: 'center', alignItems: 'center', margin: 4 },
  cellText: { fontSize: 32, fontWeight: '700' },
})
