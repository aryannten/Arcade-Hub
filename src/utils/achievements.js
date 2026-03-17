import AsyncStorage from '@react-native-async-storage/async-storage'

const ACH_KEY = 'arcade_hub_achievements'

export const achievements = {
  firstGame: {
    id: 'firstGame',
    name: 'First Steps',
    description: 'Play your first game',
    icon: '🎮',
    condition: (stats) => stats.totalGamesPlayed >= 1,
  },
  memoryMaster: {
    id: 'memoryMaster',
    name: 'Memory Master',
    description: 'Win Memory Match in under 20 moves',
    icon: '🧠',
    condition: (stats) => stats.memory?.bestScore != null && stats.memory.bestScore <= 20,
  },
  reactionPro: {
    id: 'reactionPro',
    name: 'Lightning Reflexes',
    description: 'Achieve reaction time under 200ms',
    icon: '⚡',
    condition: (stats) => stats.reactiontest?.bestReaction != null && stats.reactiontest.bestReaction < 200,
  },
  numberWizard: {
    id: 'numberWizard',
    name: 'Number Wizard',
    description: 'Guess the number in 3 attempts or less',
    icon: '🏆',
    condition: (stats) => stats.numberguesser?.minAttempts != null && stats.numberguesser.minAttempts <= 3,
  },
  snakeChampion: {
    id: 'snakeChampion',
    name: 'Snake Champion',
    description: 'Reach a score of 50 in Snake',
    icon: '🐍',
    condition: (stats) => stats.snake?.bestScore != null && stats.snake.bestScore >= 50,
  },
  ticTacToeMaster: {
    id: 'ticTacToeMaster',
    name: 'Tic Tac Toe Master',
    description: 'Win 10 games of Tic Tac Toe',
    icon: '🎮',
    condition: (stats) => stats.tictactoe?.gamesWon != null && stats.tictactoe.gamesWon >= 10,
  },
  arcadeAddict: {
    id: 'arcadeAddict',
    name: 'Arcade Addict',
    description: 'Play 50 games total',
    icon: '🎯',
    condition: (stats) => stats.totalGamesPlayed >= 50,
  },
  perfectionist: {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Win all game types at least once',
    icon: '⭐',
    condition: (stats) => {
      const games = ['memory', 'reactiontest', 'numberguesser', 'rockpaperscissors', 'tictactoe', 'snake']
      return games.every((g) => (stats[g]?.gamesWon ?? 0) > 0)
    },
  },
}

export const achievementManager = {
  getUnlocked: async () => {
    try {
      const s = await AsyncStorage.getItem(ACH_KEY)
      return s ? JSON.parse(s) : []
    } catch {
      return []
    }
  },

  unlock: async (achievementId) => {
    try {
      const unlocked = await achievementManager.getUnlocked()
      if (unlocked.includes(achievementId)) return false
      unlocked.push(achievementId)
      await AsyncStorage.setItem(ACH_KEY, JSON.stringify(unlocked))
      return true
    } catch {
      return false
    }
  },

  checkAchievements: async (allStats) => {
    const unlocked = await achievementManager.getUnlocked()
    const totalGamesPlayed = Object.values(allStats).reduce(
      (sum, s) => sum + (s.gamesPlayed || 0),
      0
    )
    const statsWithTotal = { ...allStats, totalGamesPlayed }
    const newlyUnlocked = []
    for (const a of Object.values(achievements)) {
      if (unlocked.includes(a.id)) continue
      if (!a.condition(statsWithTotal)) continue
      if (await achievementManager.unlock(a.id)) newlyUnlocked.push(a)
    }
    return newlyUnlocked
  },

  getAllAchievements: async () => {
    const unlocked = await achievementManager.getUnlocked()
    return Object.values(achievements).map((a) => ({
      ...a,
      unlocked: unlocked.includes(a.id),
    }))
  },
}
