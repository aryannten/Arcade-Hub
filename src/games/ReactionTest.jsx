import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { storage } from '../utils/storage'
import { colors as designColors, gradients, spacing, typography, shadows } from '../design/tokens'
import GlassCard from '../design/components/GlassCard'
import GradientButton from '../design/components/GradientButton'
import StatBar from '../design/components/StatBar'
import { resolveThemeColors } from '../utils/theme'

export default function ReactionTest({ onBack, colors }) {
  const themeColors = resolveThemeColors(colors)
  const idleSurface = themeColors.name === 'light' ? 'rgba(255,255,255,0.9)' : designColors.Surface
  const [phase, setPhase] = useState('start') // start | wait | go | result
  const [startTime, setStartTime] = useState(null)
  const [reaction, setReaction] = useState(null)
  const [best, setBest] = useState(null)
  const timeoutRef = useRef(null)
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const colorAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    storage.getGameStats('reactiontest').then((s) => {
      if (s.bestReaction != null) setBest(s.bestReaction)
    })
    // Entry animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start()
    return () => clearTimeout(timeoutRef.current)
  }, [])

  const begin = () => {
    setReaction(null)
    setPhase('wait')
    // Animate to wait color
    Animated.timing(colorAnim, {
      toValue: 0.5,
      duration: 300,
      useNativeDriver: false
    }).start()
    const delay = 800 + Math.floor(Math.random() * 2000)
    timeoutRef.current = setTimeout(() => {
      setPhase('go')
      setStartTime(performance.now())
      // Animate to go color
      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false
      }).start()
    }, delay)
  }

  const handlePress = () => {
    if (phase === 'wait') {
      clearTimeout(timeoutRef.current)
      setPhase('start')
      setReaction('Too soon!')
      // Reset color animation
      Animated.timing(colorAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      }).start()
      return
    }
    if (phase === 'go') {
      const rt = Math.round(performance.now() - startTime)
      setReaction(rt)
      setPhase('result')
      // Result scale animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start()
      // Reset color animation
      Animated.timing(colorAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      }).start()
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
    // Reset color animation
    Animated.timing(colorAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false
    }).start()
  }

  // Interpolate background color for tap area
  const tapAreaBg = colorAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      idleSurface,
      designColors.NeonAmber + '40',
      designColors.Success + '80'
    ]
  })

  return (
    <View style={[styles.container, { backgroundColor: themeColors.bg }]}>
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        {/* Header with gradient accent */}
        <LinearGradient
          colors={gradients.reactionTest}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={[styles.header, { backgroundColor: themeColors.bg }]}>
            <GradientButton
              gradient={gradients.reactionTest}
              label="← Back"
              onPress={onBack}
              style={styles.backButton}
            />
            <Text style={[styles.title, { color: themeColors.text }]}>Reaction Test</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>

        {/* Tap area with glassmorphism and neon border */}
        <TouchableOpacity
          style={styles.tapAreaTouchable}
          onPress={phase === 'start' ? begin : handlePress}
          activeOpacity={1}
        >
          <Animated.View
            style={[
              styles.tapArea,
              {
                backgroundColor: phase === 'start' || phase === 'result' 
                  ? idleSurface
                  : tapAreaBg
              }
            ]}
          >
            {phase === 'start' && (
              <View style={styles.centered}>
                <Text style={[styles.msg, { color: themeColors.text }]}>Tap to start</Text>
                <GradientButton
                  gradient={gradients.reactionTest}
                  label="Start Test"
                  onPress={begin}
                  style={styles.startButton}
                />
              </View>
            )}
            {phase === 'wait' && (
              <Text style={[styles.msg, { color: themeColors.text }]}>Wait for green...</Text>
            )}
            {phase === 'go' && (
              <Text style={[styles.msg, styles.msgGo]}>Tap!</Text>
            )}
            {phase === 'result' && (
              <Animated.View style={[styles.centered, { transform: [{ scale: scaleAnim }] }]}>
                <Text style={[styles.msg, { color: themeColors.text }]}>
                  {reaction === 'Too soon!' ? reaction : `${reaction} ms`}
                </Text>
                <GradientButton
                  gradient={gradients.reactionTest}
                  label="Try Again"
                  onPress={begin}
                  style={styles.startButton}
                />
              </Animated.View>
            )}
          </Animated.View>
        </TouchableOpacity>

        {/* Stats with StatBar components */}
        <GlassCard style={styles.statsCard} colors={themeColors}>
          <StatBar
            label="Last"
            value={reaction ? (reaction === 'Too soon!' ? reaction : `${reaction} ms`) : '–'}
            color={designColors.Success}
            colors={themeColors}
          />
          <View style={styles.statSpacer} />
          <StatBar
            label="Best"
            value={best != null ? `${best} ms` : '–'}
            color={designColors.Success}
            colors={themeColors}
          />
        </GlassCard>

        {/* Reset button */}
        <GradientButton
          gradient={gradients.reactionTest}
          label="Reset"
          onPress={reset}
          style={styles.resetButton}
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerGradient: {
    borderRadius: spacing.lg,
    padding: 2,
    margin: spacing.lg,
    marginBottom: spacing.md
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: spacing.lg,
    padding: spacing.md
  },
  backButton: {
    minHeight: 44,
    minWidth: 80
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  placeholder: {
    width: 80
  },
  tapAreaTouchable: {
    flex: 1,
    margin: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    minHeight: 300
  },
  tapArea: {
    flex: 1,
    borderRadius: spacing.lg,
    borderWidth: 2,
    borderColor: designColors.Success,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.neonGlow
  },
  centered: {
    alignItems: 'center'
  },
  msg: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.heading,
    fontWeight: 'bold',
    marginBottom: spacing.lg
  },
  msgGo: {
    color: '#FFFFFF',
    fontSize: 48
  },
  startButton: {
    minHeight: 44,
    minWidth: 120
  },
  statsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md
  },
  statSpacer: {
    height: spacing.sm
  },
  resetButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    minHeight: 44
  }
})
