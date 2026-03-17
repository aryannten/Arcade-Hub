import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEYS = {
  STATS: 'arcade_hub_stats',
  SETTINGS: 'arcade_hub_settings',
}

export const storage = {
  getStats: async () => {
    try {
      const stats = await AsyncStorage.getItem(STORAGE_KEYS.STATS)
      return stats ? JSON.parse(stats) : {}
    } catch (e) {
      return {}
    }
  },

  updateGameStats: async (gameId, stats) => {
    try {
      const allStats = await storage.getStats()
      const gameStats = allStats[gameId] || {
        gamesPlayed: 0,
        gamesWon: 0,
        bestScore: null,
        totalScore: 0,
        lastPlayed: null,
      }
      if (stats.gamesPlayed !== undefined) gameStats.gamesPlayed += stats.gamesPlayed
      if (stats.gamesWon !== undefined) gameStats.gamesWon += stats.gamesWon
      if (stats.score !== undefined) {
        gameStats.totalScore += stats.score
        const lowerIsBetter = gameId === 'memory'
        if (gameStats.bestScore == null) {
          gameStats.bestScore = stats.score
        } else if (lowerIsBetter ? stats.score < gameStats.bestScore : stats.score > gameStats.bestScore) {
          gameStats.bestScore = stats.score
        }
      }
      if (stats.bestTime !== undefined) {
        if (gameStats.bestTime == null || stats.bestTime < gameStats.bestTime) {
          gameStats.bestTime = stats.bestTime
        }
      }
      if (stats.bestReaction !== undefined && stats.bestReaction != null) {
        if (gameStats.bestReaction == null || stats.bestReaction < gameStats.bestReaction) {
          gameStats.bestReaction = stats.bestReaction
        }
      }
      if (stats.minAttempts !== undefined && stats.minAttempts != null) {
        if (gameStats.minAttempts == null || stats.minAttempts < gameStats.minAttempts) {
          gameStats.minAttempts = stats.minAttempts
        }
      }
      if (stats.bestScore !== undefined && stats.bestScore != null) {
        if (gameStats.bestScore == null || stats.bestScore > gameStats.bestScore) {
          gameStats.bestScore = stats.bestScore
        }
      }
      gameStats.lastPlayed = new Date().toISOString()
      allStats[gameId] = gameStats
      await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(allStats))
      return gameStats
    } catch (e) {
      return null
    }
  },

  getGameStats: async (gameId) => {
    const allStats = await storage.getStats()
    return allStats[gameId] || {
      gamesPlayed: 0,
      gamesWon: 0,
      bestScore: null,
      totalScore: 0,
      bestTime: null,
      bestReaction: null,
      minAttempts: null,
      lastPlayed: null,
    }
  },

  clearStats: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.STATS)
    } catch (e) {}
  },

  getSettings: async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS)
      return s ? JSON.parse(s) : { soundEnabled: false }
    } catch {
      return { soundEnabled: false }
    }
  },

  saveSettings: async (settings) => {
    try {
      const current = await storage.getSettings()
      const next = { ...current, ...settings }
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(next))
      return next
    } catch {
      return null
    }
  },
}
