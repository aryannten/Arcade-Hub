import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { storage } from '../utils/storage'
import { soundManager } from '../utils/sounds'

const { width: W, height: SCREEN_H } = Dimensions.get('window')
const H = Math.min(SCREEN_H - 220, 450) // Responsive height
const GRAVITY = 0.5
const JUMP = -8
const PIPE_SPEED = 3
const PIPE_GAP = 100
const PIPE_SPACING = 180
const BIRD_X = W * 0.3
const BIRD_SIZE = 28

export default function FlappyBird({ onBack, colors }) {
  const [birdY, setBirdY] = useState(H / 2 - BIRD_SIZE / 2)
  const [velocity, setVelocity] = useState(0)
  const [pipes, setPipes] = useState([])
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [started, setStarted] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const pipeIdRef = useRef(0)
  const loopRef = useRef(null)
  const velRef = useRef(0)
  const yRef = useRef(H / 2 - BIRD_SIZE / 2)

  useEffect(() => {
    yRef.current = birdY
  }, [birdY])
  useEffect(() => {
    velRef.current = velocity
  }, [velocity])

  useEffect(() => {
    storage.getGameStats('flappybird').then((s) => {
      if (s.bestScore != null) setHighScore(s.bestScore)
    })
  }, [])

  const jump = () => {
    if (!started && !gameOver) setStarted(true)
    if (!gameOver) {
      velRef.current = JUMP
      setVelocity(JUMP)
      soundManager.playMove()
    }
  }

  const hit = (pipe, by) => {
    const bx = BIRD_X
    if (bx < pipe.x + 50 && bx + BIRD_SIZE > pipe.x) {
      if (by < pipe.topHeight || by + BIRD_SIZE > pipe.topHeight + PIPE_GAP) return true
    }
    return false
  }

  useEffect(() => {
    if (!started || gameOver) {
      if (loopRef.current) {
        clearInterval(loopRef.current)
        loopRef.current = null
      }
      return
    }
    loopRef.current = setInterval(() => {
      velRef.current += GRAVITY
      setVelocity(velRef.current)
      const ny = yRef.current + velRef.current
      if (ny < 0 || ny > H - BIRD_SIZE) {
        setGameOver(true)
        soundManager.playError()
        setScore((s) => {
          if (s > highScore) {
            setHighScore(s)
            storage.updateGameStats('flappybird', { gamesPlayed: 1, bestScore: s })
          } else {
            storage.updateGameStats('flappybird', { gamesPlayed: 1 })
          }
          return s
        })
      } else {
        yRef.current = ny
        setBirdY(ny)
      }

      setPipes((prev) => {
        let next = prev.map((p) => ({ ...p, x: p.x - PIPE_SPEED })).filter((p) => p.x > -60)
        next.forEach((p) => {
          if (hit(p, yRef.current)) {
            setGameOver(true)
            soundManager.playError()
            setScore((s) => {
              if (s > highScore) {
                setHighScore(s)
                storage.updateGameStats('flappybird', { gamesPlayed: 1, bestScore: s })
              } else {
                storage.updateGameStats('flappybird', { gamesPlayed: 1 })
              }
              return s
            })
          }
          if (p.x < BIRD_X && p.x + 50 > BIRD_X && !p.passed) {
            p.passed = true
            setScore((s) => s + 1)
            soundManager.playSuccess()
          }
        })
        if (next.length === 0 || next[next.length - 1].x < W - PIPE_SPACING) {
          const top = 50 + Math.random() * (H - PIPE_GAP - 120)
          next.push({ id: pipeIdRef.current++, x: W, topHeight: top, passed: false })
        }
        return next
      })
    }, 16)
    return () => {
      if (loopRef.current) clearInterval(loopRef.current)
    }
  }, [started, gameOver, highScore])

  const reset = () => {
    setBirdY(H / 2 - BIRD_SIZE / 2)
    setVelocity(0)
    velRef.current = 0
    yRef.current = H / 2 - BIRD_SIZE / 2
    setPipes([])
    setScore(0)
    setGameOver(false)
    setStarted(false)
    pipeIdRef.current = 0
    soundManager.playClick()
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={[styles.btn, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.btnText, { color: colors.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Flappy Bird</Text>
        <TouchableOpacity onPress={reset} style={[styles.btn, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.btnText, { color: colors.text }]}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.info, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <Text style={[styles.infoText, { color: colors.text }]}>Score: {score}</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>Best: {highScore}</Text>
        {gameOver && <Text style={[styles.over, { color: colors.error }]}>Game Over</Text>}
        {!started && !gameOver && <Text style={[styles.hint, { color: colors.textSecondary }]}>Tap to fly!</Text>}
      </View>

      <TouchableOpacity
        style={[styles.area, { backgroundColor: '#7dd3fc33', borderColor: colors.border }]}
        onPress={jump}
        activeOpacity={1}
      >
        <View
          style={[
            styles.bird,
            {
              left: BIRD_X,
              top: birdY,
              width: BIRD_SIZE,
              height: BIRD_SIZE,
              transform: [{ rotate: `${Math.min(velocity * 2, 35)}deg` }],
            },
          ]}
        >
          <Text style={styles.birdEmoji}>🐦</Text>
        </View>
        {pipes.map((p) => (
          <View key={p.id}>
            <View style={[styles.pipe, styles.pipeTop, { left: p.x, height: p.topHeight }]} />
            <View
              style={[
                styles.pipe,
                styles.pipeBottom,
                { left: p.x, top: p.topHeight + PIPE_GAP, height: H - p.topHeight - PIPE_GAP },
              ]}
            />
          </View>
        ))}
      </TouchableOpacity>
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
  over: { fontWeight: '600' },
  hint: { fontSize: 13 },
  area: { flex: 1, marginHorizontal: 16, borderRadius: 12, borderWidth: 1, overflow: 'hidden', position: 'relative' },
  bird: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  birdEmoji: { fontSize: 24 },
  pipe: { position: 'absolute', width: 50, backgroundColor: '#10b981', left: 0 },
  pipeTop: { top: 0, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  pipeBottom: { borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
})
