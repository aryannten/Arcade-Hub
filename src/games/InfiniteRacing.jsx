import { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { storage } from '../utils/storage'
import { soundManager } from '../utils/sounds'
import { colors as designColors, gradients, spacing, typography, shadows } from '../design/tokens'
import GlassCard from '../design/components/GlassCard'
import GradientButton from '../design/components/GradientButton'
import StatBar from '../design/components/StatBar'

const W = Dimensions.get('window').width
const LANE_W = W / 3
const CAR_W = 36
const CAR_H = 50
const INIT_SPEED = 2.5
const SPEED_INC = 0.4

function laneX(lane) {
  return lane * LANE_W + LANE_W / 2 - CAR_W / 2
}

export default function InfiniteRacing({ onBack, colors }) {
  const [lane, setLane] = useState(1)
  const [obstacles, setObstacles] = useState([])
  const [score, setScore] = useState(0)
  const [speed, setSpeed] = useState(INIT_SPEED)
  const [gameOver, setGameOver] = useState(false)
  const [paused, setPaused] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const laneRef = useRef(1)
  const scoreRef = useRef(0)
  const speedRef = useRef(INIT_SPEED)
  const overRef = useRef(false)
  const pauseRef = useRef(false)
  const idRef = useRef(0)
  const loopRef = useRef(null)
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const playerPosAnim = useRef(new Animated.Value(laneX(1))).current

  useEffect(() => {
    laneRef.current = lane
  }, [lane])
  useEffect(() => {
    scoreRef.current = score
  }, [score])
  useEffect(() => {
    speedRef.current = speed
  }, [speed])
  useEffect(() => {
    overRef.current = gameOver
  }, [gameOver])
  useEffect(() => {
    pauseRef.current = paused
  }, [paused])

  useEffect(() => {
    storage.getGameStats('infiniteracing').then((s) => {
      if (s.bestScore != null) setHighScore(s.bestScore)
    })
    
    // Entry animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start()
  }, [])

  const left = useCallback(() => {
    if (overRef.current || pauseRef.current || laneRef.current <= 0) return
    const n = laneRef.current - 1
    laneRef.current = n
    setLane(n)
    // Smooth player movement animation
    Animated.timing(playerPosAnim, {
      toValue: laneX(n),
      duration: 150,
      useNativeDriver: true
    }).start()
    soundManager.playMove()
  }, [playerPosAnim])
  const right = useCallback(() => {
    if (overRef.current || pauseRef.current || laneRef.current >= 2) return
    const n = laneRef.current + 1
    laneRef.current = n
    setLane(n)
    // Smooth player movement animation
    Animated.timing(playerPosAnim, {
      toValue: laneX(n),
      duration: 150,
      useNativeDriver: true
    }).start()
    soundManager.playMove()
  }, [playerPosAnim])

  const collides = useCallback((obs) => {
    const px = laneX(laneRef.current)
    const py = 280
    const ox = laneX(obs.lane)
    const oy = obs.y
    return px < ox + CAR_W && px + CAR_W > ox && py < oy + CAR_H && py + CAR_H > oy
  }, [])

  useEffect(() => {
    if (pauseRef.current || overRef.current) {
      if (loopRef.current) {
        clearInterval(loopRef.current)
        loopRef.current = null
      }
      return
    }
    loopRef.current = setInterval(() => {
      setObstacles((prev) => {
        let next = prev.map((o) => ({ ...o, y: o.y + speedRef.current })).filter((o) => o.y < 400)
        next.forEach((o) => {
          if (collides(o) && !overRef.current) {
            overRef.current = true
            setGameOver(true)
            soundManager.playError()
            const sc = scoreRef.current
            if (sc > highScore) {
              setHighScore(sc)
              storage.updateGameStats('infiniteracing', { gamesPlayed: 1, bestScore: sc })
            } else {
              storage.updateGameStats('infiniteracing', { gamesPlayed: 1 })
            }
          }
        })
        if (Math.random() < 0.02) {
          next.push({ id: idRef.current++, lane: Math.floor(Math.random() * 3), y: -CAR_H })
        }
        return next
      })
      setScore((s) => {
        const n = s + 1
        scoreRef.current = n
        if (n % 100 === 0 && n > 0) {
          setSpeed((sp) => {
            const ns = Math.min(sp + SPEED_INC, 12)
            speedRef.current = ns
            soundManager.playSuccess()
            return ns
          })
        }
        return n
      })
    }, 16)
    return () => {
      if (loopRef.current) clearInterval(loopRef.current)
    }
  }, [gameOver, paused, highScore, collides])

  const reset = () => {
    if (loopRef.current) clearInterval(loopRef.current)
    setLane(1)
    laneRef.current = 1
    setObstacles([])
    setScore(0)
    scoreRef.current = 0
    setSpeed(INIT_SPEED)
    speedRef.current = INIT_SPEED
    setGameOver(false)
    overRef.current = false
    setPaused(false)
    pauseRef.current = false
    idRef.current = 0
    soundManager.playClick()
  }

  const togglePause = () => {
    if (!overRef.current) {
      setPaused((p) => !p)
      pauseRef.current = !pauseRef.current
      soundManager.playClick()
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={[styles.btn, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.btnText, { color: colors.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Infinite Racing</Text>
        <TouchableOpacity onPress={reset} style={[styles.btn, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.btnText, { color: colors.text }]}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.info, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <Text style={[styles.infoText, { color: colors.text }]}>Score: {score}</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>Best: {highScore}</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>Speed: {speed.toFixed(1)}x</Text>
        {paused && <Text style={[styles.pause, { color: colors.warning }]}>⏸ Paused</Text>}
        {gameOver && <Text style={[styles.over, { color: colors.error }]}>Game Over</Text>}
      </View>

      <View style={[styles.road, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={[styles.player, { left: laneX(lane) }]}>
          <Text style={styles.carEmoji}>🚗</Text>
        </View>
        {obstacles.map((o) => (
          <View key={o.id} style={[styles.obs, { left: laneX(o.lane), top: o.y }]}>
            <Text style={styles.carEmoji}>🚙</Text>
          </View>
        ))}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={left}
          disabled={gameOver || paused || lane === 0}
          style={[styles.ctrl, { backgroundColor: colors.cardBg }]}
        >
          <Text style={[styles.ctrlText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={togglePause} disabled={gameOver} style={[styles.ctrl, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.ctrlText, { color: colors.text }]}>{paused ? '▶' : '⏸'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={right}
          disabled={gameOver || paused || lane === 2}
          style={[styles.ctrl, { backgroundColor: colors.cardBg }]}
        >
          <Text style={[styles.ctrlText, { color: colors.text }]}>→</Text>
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
  info: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, marginHorizontal: 16, marginBottom: 8, borderRadius: 8, borderWidth: 1 },
  infoText: { fontSize: 14, fontWeight: '600' },
  pause: { fontWeight: '600' },
  over: { fontWeight: '600' },
  road: { flex: 1, marginHorizontal: 16, borderRadius: 12, borderWidth: 1, position: 'relative', overflow: 'hidden' },
  player: { position: 'absolute', bottom: 60, width: CAR_W, height: CAR_H, justifyContent: 'center', alignItems: 'center' },
  obs: { position: 'absolute', width: CAR_W, height: CAR_H, justifyContent: 'center', alignItems: 'center' },
  carEmoji: { fontSize: 28 },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 16, paddingVertical: 16 },
  ctrl: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 10 },
  ctrlText: { fontSize: 22, fontWeight: '700' },
})
