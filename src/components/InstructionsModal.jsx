import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { soundManager } from '../utils/sounds'

const INSTRUCTIONS = {
  all: {
    title: 'Game Instructions',
    items: [
      { icon: '🧠', title: 'Memory Match', text: 'Flip cards to find matching pairs. Complete with as few moves as possible!' },
      { icon: '⚡', title: 'Reaction Test', text: 'Wait for green, then tap as fast as you can!' },
      { icon: '🏆', title: 'Number Guesser', text: 'Guess the secret number. You get hints if too high or too low.' },
      { icon: '✂️', title: 'Rock Paper Scissors', text: 'Choose rock, paper, or scissors to beat the computer!' },
      { icon: '🎮', title: 'Tic Tac Toe', text: 'Get three in a row. Play vs computer or a friend.' },
      { icon: '🐍', title: 'Snake', text: 'Control the snake, eat food, avoid walls and yourself!' },
      { icon: '🏎️', title: 'Infinite Racing', text: 'Avoid obstacles and survive as long as you can!' },
      { icon: '🐦', title: 'Flappy Bird', text: 'Tap to fly through pipes. Don\'t hit them!' },
      { icon: '🎯', title: 'Breakout', text: 'Break all bricks with the paddle. Don\'t let the ball fall!' },
    ],
  },
  memory: {
    title: 'Memory Match',
    items: [
      'Tap cards to flip them',
      'Find matching pairs',
      'Complete with as few moves as possible',
      'Choose Easy (6 pairs), Medium (8), or Hard (12)',
    ],
  },
  reactiontest: {
    title: 'Reaction Test',
    items: ['Tap "Start" to begin', 'Wait for the screen to turn GREEN', 'Tap as fast as you can when green', "Don't tap too early!", 'Beat your best reaction time!'],
  },
  numberguesser: {
    title: 'Number Guesser',
    items: ['Pick difficulty (Easy 1–10, Medium 1–50, Hard 1–100)', 'Enter your guess', "You'll get \"Too high\" or \"Too low\"", 'Find the number in as few attempts as possible!'],
  },
  rockpaperscissors: {
    title: 'Rock Paper Scissors',
    items: ['Choose Rock 🪨, Paper 📄, or Scissors ✂️', 'Rock beats Scissors, Scissors beat Paper, Paper beats Rock', 'First to reach the target wins!', 'Tap Reset to start over.'],
  },
  tictactoe: {
    title: 'Tic Tac Toe',
    items: ['Play vs Computer or vs Player', 'Player 1 is X, Player 2/Computer is O', 'Get three in a row to win!', "It's a draw if the board fills with no winner."],
  },
  snake: {
    title: 'Snake',
    items: ['Use arrow buttons or keys to move', 'Eat food to grow and score', 'Avoid walls and your tail', 'Tap Pause to pause.'],
  },
  infiniteracing: {
    title: 'Infinite Racing',
    items: ['Use ← → buttons or keys to change lanes', 'Avoid oncoming cars', 'Score increases as you survive', 'Speed increases every 100 points. Pause with ⏸.'],
  },
  flappybird: {
    title: 'Flappy Bird',
    items: ['Tap the screen to fly up', 'Navigate through pipe gaps', "Don't hit pipes or the ground", 'Score by passing through pipes.'],
  },
  breakout: {
    title: 'Breakout',
    items: ['Drag to move the paddle (or use touch)', 'Tap to launch the ball', 'Break all bricks to win', 'You have 3 lives. Each brick = 10 points.'],
  },
}

export default function InstructionsModal({ gameId, onClose, visible, colors }) {
  const data = INSTRUCTIONS[gameId] || INSTRUCTIONS.all

  const handleClose = () => {
    soundManager.playClick()
    onClose()
  }

  const renderContent = () => {
    if (data === INSTRUCTIONS.all) {
      return (
        <View style={styles.list}>
          {data.items.map((item, i) => (
            <View key={i} style={[styles.item, { borderColor: colors.border }]}>
              <Text style={styles.itemIcon}>{item.icon}</Text>
              <View style={styles.itemText}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.itemDesc, { color: colors.textSecondary }]}>{item.text}</Text>
              </View>
            </View>
          ))}
        </View>
      )
    }
    return (
      <View style={styles.ol}>
        {data.items.map((line, i) => (
          <View key={i} style={styles.li}>
            <Text style={[styles.bullet, { color: colors.primary }]}>{i + 1}.</Text>
            <Text style={[styles.liText, { color: colors.text }]}>{line}</Text>
          </View>
        ))}
      </View>
    )
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose}>
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.modal, { backgroundColor: colors.cardBg }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{data.title}</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={12} style={styles.closeBtn}>
              <Text style={[styles.closeText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {renderContent()}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontWeight: '700' },
  closeBtn: { padding: 4 },
  closeText: { fontSize: 22, fontWeight: '300' },
  body: { maxHeight: 400, padding: 16 },
  list: { gap: 12 },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  itemIcon: { fontSize: 22 },
  itemText: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  itemDesc: { fontSize: 13, opacity: 0.9 },
  ol: { gap: 10 },
  li: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bullet: { fontSize: 15, fontWeight: '600', minWidth: 20 },
  liText: { flex: 1, fontSize: 14, lineHeight: 20 },
})
