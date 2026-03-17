import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { storage } from '../utils/storage'

export default function ReactionTest({ onBack, colors }) {
  const [phase, setPhase] = useState('start') // start | wait | go | result
  const [startTime, setStartTime] = useState(null)
  const [reaction, setReaction] = useState(null)
  const [best, setBest] = useState(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    storage.getGameStats('reactiontest').then((s) => {
      if (s.bestReaction != null) setBest(s.bestReaction)
    })
    return () => clearTimeout(timeoutRef.current)
  }, [])

  const begin = () => {
    setReaction(null)
    setPhase('wait')
    const delay = 800 + Math.floor(Math.random() * 2000)
    timeoutRef.current = setTimeout(() => {
      setPhase('go')
      setStartTime(performance.now())
    }, delay)
  }

  const handlePress = () => {
    if (phase === 'wait') {
      clearTimeout(timeoutRef.current)
      setPhase('start')
      setReaction('Too soon!')
      return
    }
    if (phase === 'go') {
      const rt = Math.round(performance.now() - startTime)
      setReaction(rt)
      setPhase('result')
      if (best == null || rt < best) {
        setBest(rt)
        storage.updateGameStats('reactiontest', { gamesPlayed: 1, bestReaction: rt })
      } else {
        storage.updateGameStats('reactiontest', { gamesPlayed: 1 })
      }
      return
    }
    if (phase === 'result') {
      begin()
    }
  }

  const reset = () => {
    setPhase('start')
    setReaction(null)
  }

  const boxBg =
    phase === 'start' ? colors.cardBg
    : phase === 'wait' ? colors.warning + '40'
    : phase === 'go' ? colors.success
    : colors.cardBg

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={[styles.btn, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.btnText, { color: colors.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Reaction Test</Text>
        <View style={styles.placeholder} />
      </View>

      <TouchableOpacity
        style={[styles.box, { backgroundColor: boxBg, borderColor: colors.border }]}
        onPress={phase === 'start' ? begin : handlePress}
        activeOpacity={1}
      >
        {phase === 'start' && (
          <View style={styles.centered}>
            <Text style={[styles.msg, { color: colors.text }]}>Tap to start</Text>
            <View style={[styles.startBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.startBtnText}>Start Test</Text>
            </View>
          </View>
        )}
        {phase === 'wait' && <Text style={[styles.msg, { color: colors.text }]}>Wait for green...</Text>}
        {phase === 'go' && <Text style={[styles.msg, { color: '#fff' }]}>Tap!</Text>}
        {phase === 'result' && (
          <View style={styles.centered}>
            <Text style={[styles.msg, { color: colors.text }]}>
              {reaction === 'Too soon!' ? reaction : `${reaction} ms`}
            </Text>
            <View style={[styles.startBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.startBtnText}>Try Again</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <View style={[styles.footer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <TouchableOpacity onPress={reset} style={[styles.footerBtn, { borderColor: colors.border }]}>
          <Text style={[styles.footerBtnText, { color: colors.text }]}>Reset</Text>
        </TouchableOpacity>
        <View style={styles.stats}>
          <Text style={[styles.statText, { color: colors.text }]}>
            Last: {reaction ? (reaction === 'Too soon!' ? reaction : `${reaction} ms`) : '–'}
          </Text>
          <Text style={[styles.statText, { color: colors.text }]}>Best: {best != null ? `${best} ms` : '–'}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  btnText: { fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700' },
  placeholder: { width: 70 },
  box: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  msg: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
  centered: { alignItems: 'center' },
  startBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  startBtnText: { color: '#fff', fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTopWidth: 1 },
  footerBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  footerBtnText: { fontWeight: '600' },
  stats: { gap: 4 },
  statText: { fontSize: 14 },
})
