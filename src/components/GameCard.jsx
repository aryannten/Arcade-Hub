import React, { useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native'
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons'
import LinearGradient from 'react-native-linear-gradient'
import GlassCard from '../design/components/GlassCard'
import DifficultyBadge from '../design/components/DifficultyBadge'
import { colors as designColors, gradients, spacing } from '../design/tokens'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2 // 2 cards per row with padding

// Map game titles to gradient keys
const GAME_GRADIENT_MAP = {
  'Memory Match': 'memoryMatch',
  'Reaction Test': 'reactionTest',
  'Number Guesser': 'numberGuesser',
  'Rock Paper Scissors': 'rockPaperScissors',
  'Tic Tac Toe': 'ticTacToe',
  'Snake': 'snake',
  'Infinite Racing': 'infiniteRacing',
  'Flappy Bird': 'flappyBird',
  'Breakout': 'breakout'
}

export default function GameCard({ 
  title, 
  description, 
  iconName, 
  iconFamily = 'MaterialCommunityIcons', 
  difficulty = 'Medium', 
  onPress, 
  colors,
  index = 0 
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  // Staggered entry animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 50, // Stagger by 50ms per card
      useNativeDriver: true
    }).start()
  }, [index])

  const IconComponent = 
    iconFamily === 'Ionicons' ? Ionicons :
    iconFamily === 'FontAwesome5' ? FontAwesome5 :
    MaterialCommunityIcons

  // Get game-specific gradient
  const gradientKey = GAME_GRADIENT_MAP[title]
  const gameGradient = gradientKey ? gradients[gradientKey] : [designColors.NeonCyan, designColors.NeonPurple]

  // Press animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true
    }).start()
  }

  const handlePress = () => {
    // Animate then call onPress
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      if (onPress) onPress()
    })
  }

  return (
    <Animated.View 
      style={[
        styles.cardWrapper,
        { 
          width: CARD_WIDTH,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.touchable}
      >
        <GlassCard style={styles.card}>
          {/* Gradient accent border */}
          <LinearGradient
            colors={gameGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientAccent}
          />
          
          <View style={styles.header}>
            {/* Icon with gradient background */}
            <LinearGradient
              colors={gameGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconWrap}
            >
              <IconComponent name={iconName} size={28} color="#fff" />
            </LinearGradient>
            
            <DifficultyBadge difficulty={difficulty} size="small" />
          </View>
          
          <Text style={[styles.title, { color: designColors.TextPrimary }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.desc, { color: designColors.TextMuted }]} numberOfLines={2}>
            {description}
          </Text>
          
          {/* Play button with gradient */}
          <LinearGradient
            colors={gameGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.playBtn}
          >
            <Ionicons name="play" size={14} color="#fff" />
            <Text style={styles.playLabel}>Play</Text>
          </LinearGradient>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: spacing.md,
  },
  touchable: {
    minWidth: 44,
    minHeight: 44,
  },
  card: {
    position: 'relative',
    overflow: 'hidden',
  },
  gradientAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { 
    fontSize: 15, 
    fontWeight: '700', 
    marginBottom: spacing.xs 
  },
  desc: { 
    fontSize: 12, 
    lineHeight: 16, 
    marginBottom: spacing.sm, 
    minHeight: 32 
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: spacing.sm,
    gap: 6,
    minHeight: 44, // Touch target requirement
  },
  playLabel: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 13 
  },
})
