<div align="center">

# Arcade Hub

**Your pocket-sized gaming paradise**

A collection of 7 classic mini-games built with React Native and Expo. Play offline, track your stats, unlock achievements, and enjoy a modern neon glassmorphism design with beautiful dark/light theme experience.

[![Download APK](https://img.shields.io/badge/Download-APK-brightgreen?style=for-the-badge&logo=android)](https://github.com/aryannten/Arcade-Hub/releases/tag/v1.0.1)

[Features](#-features) • [Games](#-games) • [Tech Stack](#%EF%B8%8F-tech-stack) • [Open Source](#-open-source)

</div>

---

## 📥 Download

**Ready to play?**

Download the latest APK from our [Releases page](https://github.com/aryannten/Arcade-Hub/releases/tag/v1.0.1) and install it on your Android device.

> Note: You may need to enable "Install from Unknown Sources" in your Android settings.

---

## ✨ Features

- **07 Classic Games** — Memory Match, Reaction Test, Number Guesser, Rock Paper Scissors, Tic Tac Toe, Snake, Flappy Bird.
- **Modern Gaming UI** — Neon glassmorphism design with gradient accents and smooth animations
- **PNG Game Assets** — High-quality image assets for enhanced visual experience in Flappy Bird and Snake
- **Fully Offline** — Play anywhere, no internet required after first load
- **Stats Tracking** — Track your performance across all games with detailed statistics
- **Achievement System** — Unlock achievements as you play and master each game
- **Dark/Light Theme** — Switch between themes with a single tap
- **Haptic Feedback** — Feel every tap and action with responsive haptics
- **Search & Filter** — Find games quickly by name or difficulty level
- **Responsive Design** — Optimized for all Android screen sizes
- **Design System** — Built with a comprehensive design token system for consistent styling

## 🎮 Games

### Memory Match  
Flip cards and match pairs. Test your memory and concentration skills with a purple neon theme.

### Reaction Test
Tap when the screen turns green! How fast are your reflexes? Features a green gradient design.

### Number Guesser
Guess the secret number between 1-100. Can you do it in the fewest attempts? Blue gradient theme.

### Rock Paper Scissors
Classic hand game against the computer. Best of luck! Amber gradient styling.

### Tic Tac Toe 
Strategic X's and O's. Play against the computer or challenge a friend. Red gradient theme.

### Snake
Eat food, grow longer, avoid walls. The classic arcade experience with cyan gradient and custom food sprite.

### Flappy Bird 
Tap to fly through pipes. Timing is everything! Light blue gradient design with custom bird sprite.

## 🛠️ Tech Stack

- **Framework:** React Native 0.81.5
- **Runtime:** Expo SDK 54
- **UI:** React 19.1.0
- **Gradients:** expo-linear-gradient
- **Storage:** @react-native-async-storage/async-storage
- **Haptics:** expo-haptics
- **Audio:** expo-av
- **Safe Area:** react-native-safe-area-context
- **Design System:** Custom design tokens with neon glassmorphism theme
- **Testing:** Jest with Property-Based Testing (fast-check)

## 📂 Project Structure

```
Arcade-Hub/
├── App.js                      # Main app entry, hub, routing
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── GameCard.jsx
│   │   └── InstructionsModal.jsx
│   ├── design/                 # Design system
│   │   ├── tokens.js           # Design tokens (colors, gradients, spacing, typography)
│   │   └── components/         # Reusable design components
│   │       ├── GlassCard.jsx
│   │       ├── GradientButton.jsx
│   │       ├── StatBar.jsx
│   │       ├── DifficultyBadge.jsx
│   │       └── NeonText.jsx
│   ├── games/                  # Individual game screens
│   │   ├── MemoryGame.jsx
│   │   ├── ReactionTest.jsx
│   │   ├── NumberGuesser.jsx
│   │   ├── RockPaperScissors.jsx
│   │   ├── TicTacToe.jsx
│   │   ├── Snake.jsx
│   │   ├── FlappyBird.jsx
│   └── utils/                  # Utility modules
│       ├── storage.js          # AsyncStorage wrapper
│       ├── theme.js            # Theme management
│       ├── sounds.js           # Haptic feedback
│       └── achievements.js     # Achievement system
├── assets/                     # App icons and splash screens
│   └── games/                  # Game-specific assets
│       ├── flappy-bird.png     # Bird sprite for Flappy Bird
│       └── snake-food.png      # Food sprite for Snake
└── __tests__/                  # Test suites
    ├── unit/                   # Unit tests
    └── property/               # Property-based tests
```

## 🎨 Design System

Arcade Hub features a comprehensive design system with:

### Design Tokens
- **Colors:** Background, Surface, Neon accents (Cyan, Purple, Amber, Red)
- **Gradients:** Game-specific 2-color gradients for each game
- **Spacing:** Consistent spacing scale (xs to xxl)
- **Typography:** Custom font families and size scale
- **Shadows:** Neon glow effects for depth and emphasis

### Reusable Components
- **GlassCard:** Glassmorphism container with blur effect
- **GradientButton:** Interactive buttons with gradient backgrounds
- **StatBar:** Statistics display with label and value
- **DifficultyBadge:** Color-coded difficulty indicators
- **NeonText:** Text with neon glow effect

## 📊 Features in Detail

### Stats System
Track your performance across all games:
- Total games played
- Games won
- Best scores
- Fastest reaction times
- Minimum attempts

### Achievement System
Unlock achievements as you play:
- First Win
- Perfect Score
- Speed Demon
- Marathon Player
- And many more!

### Theme System
Beautiful dark and light themes with modern gaming aesthetics:
- Neon glassmorphism design
- Game-specific gradient color schemes
- Smooth transitions and animations
- Consistent design token system
- Optimized for readability
- Persistent theme selection

## 🌟 Open Source

This app is open source! The complete codebase is available for you to explore, learn from, and contribute to. Feel free to check out the code, understand how it works, and see how the modern gaming UI was implemented.

### Want to explore the code?

The repository contains:
- Complete React Native source code
- Modern design system implementation
- Game logic for all 10 games
- PNG image assets for enhanced visuals
- Comprehensive utility modules
- Design tokens and reusable components
- Property-based testing with fast-check
- 97 passing tests ensuring code quality

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new games
- Improve existing games
- Enhance UI/UX
- Add new features

## 📄 License

This project is open source and available under the MIT License.

---

<div align="center">

</div>
