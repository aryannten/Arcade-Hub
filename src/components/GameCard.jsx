import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2 // 2 cards per row with padding

export default function GameCard({ title, description, icon, difficulty = 'Medium', onPress, colors }) {
  const diffColor =
    difficulty.toLowerCase() === 'easy'
      ? '#22c55e'
      : difficulty.toLowerCase() === 'hard'
        ? '#ef4444'
        : '#f59e0b'

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border, width: CARD_WIDTH }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primary + '25' }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: diffColor }]}>
          <Text style={styles.badgeText}>{difficulty}</Text>
        </View>
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>
      <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={2}>
        {description}
      </Text>
      <TouchableOpacity 
        style={[styles.playBtn, { backgroundColor: colors.primary }]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Text style={styles.playIcon}>▶</Text>
        <Text style={styles.playLabel}>Play</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 26 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  title: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  desc: { fontSize: 12, lineHeight: 16, marginBottom: 10, minHeight: 32 },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  playIcon: { color: '#fff', fontSize: 10 },
  playLabel: { color: '#fff', fontWeight: '700', fontSize: 13 },
})
