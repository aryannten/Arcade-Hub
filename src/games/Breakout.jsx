import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, PanResponder } from 'react-native'
import { storage } from '../utils/storage'
import { soundManager } from '../utils/sounds'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')
const W = SCREEN_W - 32
const H = Math.min(SCREEN_H - 250, 420) // Responsive height
const PADDLE_W = 90
const PADDLE_H = 14
const BALL = 14
const COLS = 8
const ROWS = 5
const BRICK_W = (W - 20) / COLS - 4
const BRICK_H = 22

function makeBricks() {
  const out = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      out.push({
        id: `${r}-${c}`,
        x: 10 + c * (BRICK_W + 4),
        y: 50 + r * (BRICK_H + 4),
        hit: false,
      })
    }
  }
  return out
}

function hitRect(ball, x, y, w, h) {
  return (
    ball.x < x + w &&
    ball.x + BALL > x &&
    ball.y < y + h &&
    ball.y + BALL > y
  )
}

export default function Breakout({ onBack, colors }) {
  const [paddleX, setPaddleX] = useState((W - PADDLE_W) / 2)
  const [ball, setBall] = useState({ x: W / 2 - BALL / 2, y: H - 80, dx: 3, dy: -3 })
  const [bricks, setBricks] = useState([])
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [started, setStarted] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const paddleRef = useRef((W - PADDLE_W) / 2)

  useEffect(() => {
    setBricks(makeBricks())
    storage.getGameStats('breakout').then((s) => {
      if (s.bestScore != null) setHighScore(s.bestScore)
    })
  }, [])

  useEffect(() => {
    paddleRef.current = paddleX
  }, [paddleX])

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        let x = paddleRef.current + g.dx
        x = Math.max(0, Math.min(W - PADDLE_W, x))
        setPaddleX(x)
        paddleRef.current = x
      },
    })
  ).current

  const startGame = () => {
    if (!started && !gameOver && !won) {
      setStarted(true)
      soundManager.playClick()
    }
  }

  useEffect(() => {
    if (!started || gameOver || won) return
    const iv = setInterval(() => {
      const px = paddleRef.current
      setBall((prev) => {
        let b = { ...prev, x: prev.x + prev.dx, y: prev.y + prev.dy }
        if (b.x <= 0 || b.x >= W - BALL) b = { ...b, dx: -b.dx }
        if (b.y <= 0) b = { ...b, dy: -b.dy }
        if (
          b.y + BALL >= H - PADDLE_H - 20 &&
          b.y < H &&
          b.x + BALL > px &&
          b.x < px + PADDLE_W
        ) {
          const hitPos = (b.x - px) / PADDLE_W
          b = { ...b, dy: -Math.abs(b.dy), dx: (hitPos - 0.5) * 6, y: H - PADDLE_H - 20 - BALL }
          soundManager.playMatch()
        }
        setBricks((br) => {
          let next = br
          for (const brick of br) {
            if (brick.hit) continue
            if (!hitRect(b, brick.x, brick.y, BRICK_W, BRICK_H)) continue
            next = br.map((x) => (x.id === brick.id ? { ...x, hit: true } : x))
            setScore((s) => s + 10)
            soundManager.playSuccess()
            const cx = brick.x + BRICK_W / 2
            const cy = brick.y + BRICK_H / 2
            const bcx = b.x + BALL / 2
            const bcy = b.y + BALL / 2
            const dx = bcx - cx
            const dy = bcy - cy
            if (Math.abs(dx) > Math.abs(dy)) b.dx = dx > 0 ? Math.abs(b.dx) : -Math.abs(b.dx)
            else b.dy = dy > 0 ? Math.abs(b.dy) : -Math.abs(b.dy)
            break
          }
          return next
        })
        if (b.y > H) {
          setLives((l) => {
            const n = l - 1
            if (n <= 0) {
              setGameOver(true)
              soundManager.playError()
              setScore((s) => {
                if (s > highScore) {
                  setHighScore(s)
                  storage.updateGameStats('breakout', { gamesPlayed: 1, bestScore: s })
                } else {
                  storage.updateGameStats('breakout', { gamesPlayed: 1 })
                }
                return s
              })
            } else {
              soundManager.playError()
              setStarted(false)
              setBall({ x: W / 2 - BALL / 2, y: H - 80, dx: 3, dy: -3 })
            }
            return n
          })
          return prev
        }
        setBricks((br) => {
          if (br.every((brick) => brick.hit)) {
            setWon(true)
            soundManager.playWin()
            setScore((s) => {
              if (s > highScore) {
                setHighScore(s)
                storage.updateGameStats('breakout', { gamesPlayed: 1, gamesWon: 1, bestScore: s })
              } else {
                storage.updateGameStats('breakout', { gamesPlayed: 1, gamesWon: 1 })
              }
              return s
            })
          }
          return br
        })
        return b
      })
    }, 16)
    return () => clearInterval(iv)
  }, [started, gameOver, won, highScore])

  const reset = () => {
    setBall({ x: W / 2 - BALL / 2, y: H - 80, dx: 3, dy: -3 })
    setPaddleX((W - PADDLE_W) / 2)
    paddleRef.current = (W - PADDLE_W) / 2
    setScore(0)
    setLives(3)
    setGameOver(false)
    setWon(false)
    setStarted(false)
    setBricks(makeBricks())
    soundManager.playClick()
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={[styles.btn, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.btnText, { color: colors.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Breakout</Text>
        <TouchableOpacity onPress={reset} style={[styles.btn, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.btnText, { color: colors.text }]}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.info, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <Text style={[styles.infoText, { color: colors.text }]}>Score: {score}</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>Best: {highScore}</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>Lives: {lives}</Text>
        {gameOver && <Text style={[styles.over, { color: colors.error }]}>Game Over</Text>}
        {won && <Text style={[styles.won, { color: colors.success }]}>🎉 You Won!</Text>}
        {!started && !gameOver && !won && (
          <Text style={[styles.hint, { color: colors.textSecondary }]}>Drag paddle, tap to launch</Text>
        )}
      </View>

      {!started && !gameOver && !won && (
        <TouchableOpacity
          onPress={startGame}
          style={[styles.launchBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.launchBtnText}>Tap to launch ball</Text>
        </TouchableOpacity>
      )}
      <View
        style={[styles.area, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
        {...pan.panHandlers}
      >
        {bricks.map((b) =>
          !b.hit ? (
            <View
              key={b.id}
              style={[styles.brick, { left: b.x, top: b.y, width: BRICK_W, height: BRICK_H, backgroundColor: colors.primary }]}
            />
          ) : null
        )}
        <View
          style={[
            styles.paddle,
            {
              left: paddleX,
              top: H - PADDLE_H - 10,
              width: PADDLE_W,
              height: PADDLE_H,
              backgroundColor: colors.primary,
            },
          ]}
        />
        {started && (
          <View
            style={[
              styles.ball,
              { left: ball.x, top: ball.y, width: BALL, height: BALL, backgroundColor: colors.text },
            ]}
          />
        )}
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
  over: { fontWeight: '600' },
  won: { fontWeight: '600' },
  hint: { fontSize: 13 },
  launchBtn: { marginHorizontal: 16, marginBottom: 8, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  launchBtnText: { color: '#fff', fontWeight: '600' },
  area: { flex: 1, marginHorizontal: 16, borderRadius: 12, borderWidth: 1, position: 'relative', overflow: 'hidden' },
  brick: { position: 'absolute', borderRadius: 4 },
  paddle: { position: 'absolute', borderRadius: 6 },
  ball: { position: 'absolute', borderRadius: BALL / 2 },
})
