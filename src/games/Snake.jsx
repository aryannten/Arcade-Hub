import { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { storage } from '../utils/storage'
import { soundManager } from '../utils/sounds'

const GRID = 18
const CELL = Math.floor((Dimensions.get('window').width - 32) / GRID)
const INIT = [{ x: 9, y: 9 }]
const DIRS = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }

export default function Snake({ onBack, colors }) {
  const [snake, setSnake] = useState(INIT)
  const [food, setFood] = useState({ x: 14, y: 14 })
  const [dir, setDir] = useState(DIRS.right)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [paused, setPaused] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const dirRef = useRef(DIRS.right)
  const loopRef = useRef(null)

  useEffect(() => {
    dirRef.current = dir
  }, [dir])

  useEffect(() => {
    storage.getGameStats('snake').then((s) => {
      if (s.bestScore != null) setHighScore(s.bestScore)
    })
  }, [])

  const genFood = useCallback(() => ({
    x: Math.floor(Math.random() * GRID),
    y: Math.floor(Math.random() * GRID),
  }), [])

  const gameLoop = useCallback(() => {
    if (paused || gameOver) return
    const d = dirRef.current
    setSnake((prev) => {
      const head = { x: prev[0].x + d.x, y: prev[0].y + d.y }
      if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
        setGameOver(true)
        soundManager.playError()
        const sc = score
        const hi = highScore
        if (sc > hi) {
          setHighScore(sc)
          storage.updateGameStats('snake', { gamesPlayed: 1, bestScore: sc })
        } else {
          storage.updateGameStats('snake', { gamesPlayed: 1 })
        }
        return prev
      }
      for (let i = 1; i < prev.length; i++) {
        if (prev[i].x === head.x && prev[i].y === head.y) {
          setGameOver(true)
          soundManager.playError()
          const sc = score
          const hi = highScore
          if (sc > hi) {
            setHighScore(sc)
            storage.updateGameStats('snake', { gamesPlayed: 1, bestScore: sc })
          } else {
            storage.updateGameStats('snake', { gamesPlayed: 1 })
          }
          return prev
        }
      }
      const next = [head, ...prev]
      if (head.x === food.x && head.y === food.y) {
        setScore((s) => s + 1)
        setFood(genFood())
        soundManager.playSuccess()
      } else {
        next.pop()
      }
      return next
    })
  }, [paused, gameOver, food, genFood, score, highScore])

  useEffect(() => {
    if (!gameOver && !paused) {
      loopRef.current = setInterval(gameLoop, 130)
    } else if (loopRef.current) {
      clearInterval(loopRef.current)
      loopRef.current = null
    }
    return () => {
      if (loopRef.current) clearInterval(loopRef.current)
    }
  }, [gameOver, paused, gameLoop])

  const changeDir = (d) => {
    if (gameOver || paused) return
    const cur = dirRef.current
    if (d === 'up' && cur.y === 1) return
    if (d === 'down' && cur.y === -1) return
    if (d === 'left' && cur.x === 1) return
    if (d === 'right' && cur.x === -1) return
    if (d === 'up') { dirRef.current = DIRS.up; setDir(DIRS.up); soundManager.playMove(); return }
    if (d === 'down') { dirRef.current = DIRS.down; setDir(DIRS.down); soundManager.playMove(); return }
    if (d === 'left') { dirRef.current = DIRS.left; setDir(DIRS.left); soundManager.playMove(); return }
    if (d === 'right') { dirRef.current = DIRS.right; setDir(DIRS.right); soundManager.playMove(); return }
  }

  const reset = () => {
    setSnake(INIT)
    setFood(genFood())
    setDir(DIRS.right)
    dirRef.current = DIRS.right
    setGameOver(false)
    setScore(0)
    setPaused(false)
    soundManager.playClick()
  }

  const togglePause = () => {
    if (!gameOver) {
      setPaused((p) => !p)
      soundManager.playClick()
    }
  }

  const size = GRID * CELL

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={[styles.btn, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.btnText, { color: colors.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Snake</Text>
        <TouchableOpacity onPress={reset} style={[styles.btn, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.btnText, { color: colors.text }]}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.info, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <Text style={[styles.infoText, { color: colors.text }]}>Score: {score}</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>Best: {highScore}</Text>
        {paused && <Text style={[styles.pauseText, { color: colors.warning }]}>⏸ Paused</Text>}
        {gameOver && <Text style={[styles.overText, { color: colors.error }]}>Game Over</Text>}
      </View>

      <View style={[styles.board, { width: size, height: size, backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={[styles.food, { left: food.x * CELL, top: food.y * CELL, width: CELL - 2, height: CELL - 2 }]} />
        {snake.map((seg, i) => (
          <View
            key={i}
            style={[
              styles.seg,
              { left: seg.x * CELL, top: seg.y * CELL, width: CELL - 2, height: CELL - 2, backgroundColor: i === 0 ? colors.primary : colors.primary + 'aa' },
            ]}
          />
        ))}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={() => changeDir('up')} disabled={gameOver || paused} style={[styles.arrow, styles.up, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.arrowText, { color: colors.text }]}>↑</Text>
        </TouchableOpacity>
        <View style={styles.mid}>
          <TouchableOpacity onPress={() => changeDir('left')} disabled={gameOver || paused} style={[styles.arrow, styles.side, { backgroundColor: colors.cardBg }]}>
            <Text style={[styles.arrowText, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={togglePause} disabled={gameOver} style={[styles.arrow, styles.side, { backgroundColor: colors.cardBg }]}>
            <Text style={[styles.arrowText, { color: colors.text }]}>{paused ? '▶' : '⏸'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeDir('right')} disabled={gameOver || paused} style={[styles.arrow, styles.side, { backgroundColor: colors.cardBg }]}>
            <Text style={[styles.arrowText, { color: colors.text }]}>→</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => changeDir('down')} disabled={gameOver || paused} style={[styles.arrow, styles.down, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.arrowText, { color: colors.text }]}>↓</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnText: { fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700' },
  info: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 10, marginHorizontal: 16, marginBottom: 8, borderRadius: 8, borderWidth: 1 },
  infoText: { fontSize: 14, fontWeight: '600' },
  pauseText: { fontWeight: '600' },
  overText: { fontWeight: '600' },
  board: { alignSelf: 'center', position: 'relative', borderRadius: 8, borderWidth: 1 },
  food: { position: 'absolute', backgroundColor: '#ef4444', borderRadius: 4 },
  seg: { position: 'absolute', borderRadius: 4 },
  controls: { alignItems: 'center', marginTop: 16, paddingBottom: 24 },
  arrow: { padding: 14, borderRadius: 10, minWidth: 56, alignItems: 'center' },
  arrowText: { fontSize: 20, fontWeight: '700' },
  up: { marginBottom: 4 },
  mid: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  down: { marginTop: 4 },
  side: { flex: 0 },
})
