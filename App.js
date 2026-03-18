import { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar as ExpoStatusBar } from 'expo-status-bar'
import GameCard from './src/components/GameCard'
import InstructionsModal from './src/components/InstructionsModal'
import {
  MemoryGame,
  ReactionTest,
  NumberGuesser,
  RockPaperScissors,
  TicTacToe,
  Snake,
  FlappyBird,
} from './src/games'
import { storage } from './src/utils/storage'
import { themeManager, themes } from './src/utils/theme'
import { soundManager } from './src/utils/sounds'
import { achievementManager } from './src/utils/achievements'
import { colors, gradients, spacing, typography, shadows } from './src/design/tokens'
import GlassCard from './src/design/components/GlassCard'
import GradientButton from './src/design/components/GradientButton'
import StatBar from './src/design/components/StatBar'
import DifficultyBadge from './src/design/components/DifficultyBadge'
import NeonText from './src/design/components/NeonText'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const GAMES = [
  { id: 'memory', title: 'Memory Match', description: 'Match pairs of cards', iconName: 'cards', iconFamily: 'MaterialCommunityIcons', component: MemoryGame, difficulty: 'Medium' },
  { id: 'reactiontest', title: 'Reaction Test', description: 'Tap when green!', iconName: 'flash', iconFamily: 'Ionicons', component: ReactionTest, difficulty: 'Easy' },
  { id: 'numberguesser', title: 'Number Guesser', description: 'Guess 1–100', iconName: 'numeric', iconFamily: 'MaterialCommunityIcons', component: NumberGuesser, difficulty: 'Easy' },
  { id: 'rockpaperscissors', title: 'Rock Paper Scissors', description: 'Beat the computer!', iconName: 'hand-rock', iconFamily: 'FontAwesome5', component: RockPaperScissors, difficulty: 'Easy' },
  { id: 'tictactoe', title: 'Tic Tac Toe', description: 'X and O strategy', iconName: 'grid', iconFamily: 'Ionicons', component: TicTacToe, difficulty: 'Hard' },
  { id: 'snake', title: 'Snake', description: 'Eat food, grow long', iconName: 'snake', iconFamily: 'MaterialCommunityIcons', component: Snake, difficulty: 'Medium' },
  { id: 'flappybird', title: 'Flappy Bird', description: 'Tap to fly', iconName: 'bird', iconFamily: 'MaterialCommunityIcons', component: FlappyBird, difficulty: 'Hard' },
]

export default function App() {
  const [theme, setTheme] = useState('dark')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [currentGame, setCurrentGame] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [showStats, setShowStats] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showInstructions, setShowInstructions] = useState(null)
  const [newAchievements, setNewAchievements] = useState([])
  const [statsData, setStatsData] = useState({})
  const [achievementsData, setAchievementsData] = useState([])

  const themeColors = themes[theme] || themes.dark

  useEffect(() => {
    (async () => {
      const t = await themeManager.getTheme()
      setTheme(t)
      await soundManager.init()
      setSoundEnabled(soundManager.enabled)
    })()
  }, [])

  useEffect(() => {
    if (!currentGame) return
    ;(async () => {
      const all = await storage.getStats()
      const newly = await achievementManager.checkAchievements(all)
      if (newly.length > 0) {
        setNewAchievements(newly)
        newly.forEach(() => soundManager.playWin())
        setTimeout(() => setNewAchievements([]), 5000)
      }
    })()
  }, [currentGame])

  const filteredGames = useMemo(() => {
    return GAMES.filter((g) => {
      const matchSearch =
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchDiff =
        difficultyFilter === 'all' || g.difficulty.toLowerCase() === difficultyFilter.toLowerCase()
      return matchSearch && matchDiff
    })
  }, [searchQuery, difficultyFilter])

  const currentGameData = GAMES.find((g) => g.id === currentGame)

  const loadStats = async () => {
    const all = await storage.getStats()
    setStatsData(all)
  }

  const loadAchievements = async () => {
    const all = await achievementManager.getAllAchievements()
    setAchievementsData(all)
  }

  useEffect(() => {
    if (showStats) loadStats()
  }, [showStats])

  useEffect(() => {
    if (showAchievements) loadAchievements()
  }, [showAchievements])

  const toggleTheme = async () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    await themeManager.setTheme(next)
    setTheme(next)
    soundManager.playClick()
  }

  const toggleSound = () => {
    if (soundEnabled) {
      soundManager.disable()
      setSoundEnabled(false)
    } else {
      soundManager.enable()
      setSoundEnabled(true)
    }
    soundManager.playClick()
  }

  const handleBackToHub = () => {
    setCurrentGame(null)
    soundManager.playClick()
  }

  const handleClearStats = () => {
    Alert.alert('Clear stats?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await storage.clearStats()
          await loadStats()
        },
      },
    ])
  }

  // Game screen
  if (currentGame && currentGameData) {
    const Game = currentGameData.component
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: themeColors.bg }]} edges={['top']}>
        <ExpoStatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <Game onBack={handleBackToHub} colors={themeColors} />
      </SafeAreaView>
    )
  }

  // Achievements screen
  if (showAchievements) {
    const unlocked = achievementsData.filter((a) => a.unlocked).length
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: themeColors.bg }]} edges={['top']}>
        <ExpoStatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <View style={[styles.topBar, { backgroundColor: themeColors.cardBg, borderBottomColor: themeColors.border }]}>
          <TouchableOpacity
            onPress={() => { setShowAchievements(false); soundManager.playClick() }}
            style={styles.topBarBtn}
          >
            <Text style={[styles.topBarBtnText, { color: themeColors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.topBarTitle, { color: themeColors.text }]}>🏅 Achievements</Text>
          <View style={styles.topBarBtn} />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.progressBar, { backgroundColor: themeColors.cardBg }]}>
            <View style={[styles.progressFill, { backgroundColor: themeColors.primary, width: `${(unlocked / achievementsData.length) * 100}%` }]} />
          </View>
          <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>
            {unlocked} / {achievementsData.length} unlocked
          </Text>
          <View style={styles.listContainer}>
            {achievementsData.map((a) => (
              <View
                key={a.id}
                style={[
                  styles.achCard,
                  { backgroundColor: themeColors.cardBg, borderColor: a.unlocked ? themeColors.primary : themeColors.border },
                ]}
              >
                <View style={[styles.achIconWrap, { backgroundColor: a.unlocked ? themeColors.primary + '30' : themeColors.border + '50' }]}>
                  <Text style={styles.achIcon}>{a.icon}</Text>
                </View>
                <View style={styles.achInfo}>
                  <Text style={[styles.achName, { color: themeColors.text }]}>{a.name}</Text>
                  <Text style={[styles.achDesc, { color: themeColors.textSecondary }]}>{a.description}</Text>
                </View>
                {a.unlocked && <Text style={[styles.achBadge, { color: themeColors.primary }]}>✓</Text>}
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // Stats screen
  if (showStats) {
    const totalPlayed = Object.values(statsData).reduce((s, g) => s + (g.gamesPlayed || 0), 0)
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: themeColors.bg }]} edges={['top']}>
        <ExpoStatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <View style={[styles.topBar, { backgroundColor: themeColors.cardBg, borderBottomColor: themeColors.border }]}>
          <TouchableOpacity
            onPress={() => { setShowStats(false); soundManager.playClick() }}
            style={styles.topBarBtn}
          >
            <Text style={[styles.topBarBtnText, { color: themeColors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.topBarTitle, { color: themeColors.text }]}>📊 Statistics</Text>
          <TouchableOpacity onPress={handleClearStats} style={styles.topBarBtn}>
            <Text style={[styles.topBarBtnText, { color: themeColors.error }]}>Clear</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.totalCard, { backgroundColor: themeColors.primary }]}>
            <Text style={styles.totalLabel}>Total Games Played</Text>
            <Text style={styles.totalValue}>{totalPlayed}</Text>
          </View>
          <View style={styles.statsGrid}>
            {GAMES.map((g) => {
              const st = statsData[g.id] || {}
              return (
                <View
                  key={g.id}
                  style={[styles.statCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
                >
                  <Text style={styles.statIcon}>{g.icon}</Text>
                  <Text style={[styles.statTitle, { color: themeColors.text }]} numberOfLines={1}>{g.title}</Text>
                  <View style={styles.statRow}>
                    <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Played</Text>
                    <Text style={[styles.statValue, { color: themeColors.text }]}>{st.gamesPlayed ?? 0}</Text>
                  </View>
                  {st.gamesWon > 0 && (
                    <View style={styles.statRow}>
                      <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Won</Text>
                      <Text style={[styles.statValue, { color: themeColors.success }]}>{st.gamesWon}</Text>
                    </View>
                  )}
                  {st.bestScore != null && (
                    <View style={styles.statRow}>
                      <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Best</Text>
                      <Text style={[styles.statValue, { color: themeColors.primary }]}>{st.bestScore}</Text>
                    </View>
                  )}
                  {st.bestReaction != null && (
                    <View style={styles.statRow}>
                      <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Reaction</Text>
                      <Text style={[styles.statValue, { color: themeColors.primary }]}>{st.bestReaction}ms</Text>
                    </View>
                  )}
                  {st.minAttempts != null && (
                    <View style={styles.statRow}>
                      <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Attempts</Text>
                      <Text style={[styles.statValue, { color: themeColors.primary }]}>{st.minAttempts}</Text>
                    </View>
                  )}
                </View>
              )
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // Main hub
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: themeColors.bg }]} edges={['top']}>
      <ExpoStatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.logo}>🎮</Text>
              <View>
                <NeonText color={themeColors.primary} size={typography.fontSize.xl}>
                  Arcade Hub
                </NeonText>
                <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Play offline</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                onPress={toggleSound} 
                style={[styles.iconBtn, { backgroundColor: themeColors.cardBg }]}
              >
                <Text style={styles.iconBtnText}>{soundEnabled ? '🔊' : '🔇'}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={toggleTheme} 
                style={[styles.iconBtn, { backgroundColor: themeColors.cardBg }]}
              >
                <Text style={styles.iconBtnText}>{theme === 'dark' ? '☀️' : '🌙'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            onPress={() => { setShowStats(true); soundManager.playClick() }}
            style={[styles.quickBtn, { backgroundColor: themeColors.cardBg }]}
          >
            <Text style={styles.quickIcon}>📊</Text>
            <Text style={[styles.quickLabel, { color: themeColors.text }]}>Stats</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setShowAchievements(true); soundManager.playClick() }}
            style={[styles.quickBtn, { backgroundColor: themeColors.cardBg }]}
          >
            <Text style={styles.quickIcon}>🏅</Text>
            <Text style={[styles.quickLabel, { color: themeColors.text }]}>Achievements</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setShowInstructions('all'); soundManager.playClick() }}
            style={[styles.quickBtn, { backgroundColor: themeColors.cardBg }]}
          >
            <Text style={styles.quickIcon}>❓</Text>
            <Text style={[styles.quickLabel, { color: themeColors.text }]}>Help</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={[styles.searchWrap, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search games..."
            placeholderTextColor={themeColors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={[styles.clearSearch, { color: themeColors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
          {['all', 'easy', 'medium', 'hard'].map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => setDifficultyFilter(d)}
              style={[
                styles.filterBtn,
                { backgroundColor: difficultyFilter === d ? themeColors.primary : themeColors.cardBg },
              ]}
            >
              <Text style={[styles.filterBtnText, { color: difficultyFilter === d ? '#fff' : themeColors.text }]}>
                {d === 'all' ? '🎮 All' : d === 'easy' ? '🟢 Easy' : d === 'medium' ? '🟡 Medium' : '🔴 Hard'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results hint */}
        {searchQuery.length > 0 && (
          <Text style={[styles.resultHint, { color: themeColors.textSecondary }]}>
            Found {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''}
          </Text>
        )}

        {/* Games grid */}
        <View style={styles.grid}>
          {filteredGames.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🎯</Text>
              <Text style={[styles.emptyTitle, { color: themeColors.text }]}>No games found</Text>
              <Text style={[styles.emptySub, { color: themeColors.textSecondary }]}>Try a different search</Text>
            </View>
          ) : (
            filteredGames.map((g, index) => (
              <GameCard
                key={g.id}
                title={g.title}
                description={g.description}
                iconName={g.iconName}
                iconFamily={g.iconFamily}
                difficulty={g.difficulty}
                colors={themeColors}
                index={index}
                onPress={() => {
                  setCurrentGame(g.id)
                  soundManager.playClick()
                }}
              />
            ))
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
            Arcade Hub 
          </Text>
        </View>
      </ScrollView>

      {/* Instructions modal */}
      <InstructionsModal
        visible={!!showInstructions}
        gameId={showInstructions}
        onClose={() => setShowInstructions(null)}
        colors={themeColors}
      />

      {/* Achievement popup */}
      {newAchievements.length > 0 && (
        <View style={styles.achPopup}>
          {newAchievements.map((a) => (
            <View key={a.id} style={[styles.achPopupItem, { backgroundColor: themeColors.cardBg, borderColor: themeColors.primary }]}>
              <Text style={styles.achPopupIcon}>{a.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.achPopupTitle, { color: themeColors.primary }]}>Achievement Unlocked!</Text>
                <Text style={[styles.achPopupName, { color: themeColors.text }]}>{a.name}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </SafeAreaView>
  )
}

const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  
  // Header
  header: { padding: 16, paddingBottom: 8 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerRight: { flexDirection: 'row', gap: 8 },
  logo: { fontSize: 40 },
  subtitle: { fontSize: 13, marginTop: 2 },
  iconBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 20 },

  // Quick actions
  quickActions: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  quickBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, gap: 6 },
  quickIcon: { fontSize: 16 },
  quickLabel: { fontSize: 13, fontWeight: '600' },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 10, fontSize: 16 },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 16 },
  clearSearch: { fontSize: 20, padding: 4 },

  // Filter
  filterScroll: { marginBottom: 12 },
  filterRow: { paddingHorizontal: 16, gap: 8 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  filterBtnText: { fontSize: 13, fontWeight: '600' },

  // Result hint
  resultHint: { paddingHorizontal: 16, marginBottom: 8, fontSize: 13 },

  // Grid
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: 16, 
    justifyContent: 'space-between',
  },

  // Empty state
  empty: { width: '100%', alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySub: { fontSize: 14, marginTop: 4 },

  // Footer
  footer: { padding: 24, alignItems: 'center' },
  footerText: { fontSize: 13 },

  // Top bar (for sub-screens)
  topBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 16, 
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  topBarBtn: { minWidth: 60 },
  topBarBtnText: { fontSize: 15, fontWeight: '600' },
  topBarTitle: { fontSize: 17, fontWeight: '700' },

  // Progress bar
  progressBar: { height: 8, borderRadius: 4, marginHorizontal: 16, marginTop: 16, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 13, textAlign: 'center', marginTop: 8, marginBottom: 16 },

  // List container
  listContainer: { paddingHorizontal: 16, gap: 10 },

  // Achievement cards
  achCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 14, 
    borderRadius: 14, 
    borderWidth: 2,
    gap: 12,
  },
  achIconWrap: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  achIcon: { fontSize: 24 },
  achInfo: { flex: 1 },
  achName: { fontSize: 15, fontWeight: '700' },
  achDesc: { fontSize: 12, marginTop: 2 },
  achBadge: { fontSize: 22, fontWeight: '700' },

  // Total card
  totalCard: { 
    marginHorizontal: 16, 
    marginTop: 16,
    padding: 20, 
    borderRadius: 16, 
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: { color: '#fff', fontSize: 14, opacity: 0.9 },
  totalValue: { color: '#fff', fontSize: 36, fontWeight: '800', marginTop: 4 },

  // Stats grid
  statsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: 16, 
    justifyContent: 'space-between',
  },
  statCard: { 
    width: CARD_WIDTH, 
    padding: 14, 
    borderRadius: 14, 
    borderWidth: 1, 
    marginBottom: 12,
  },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  statLabel: { fontSize: 12 },
  statValue: { fontSize: 12, fontWeight: '700' },

  // Achievement popup
  achPopup: { position: 'absolute', bottom: 24, left: 16, right: 16, gap: 8 },
  achPopupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
    gap: 12,
  },
  achPopupIcon: { fontSize: 32 },
  achPopupTitle: { fontSize: 11, fontWeight: '600' },
  achPopupName: { fontSize: 15, fontWeight: '700' },
})
