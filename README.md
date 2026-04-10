<div align="center">

# 🕹️ Arcade Hub

**Your pocket-sized gaming paradise**

A collection of 7 classic mini-games built with React Native and Expo.  
Play offline, track stats, unlock achievements — wrapped in a neon glassmorphism UI.

[![Download APK](https://img.shields.io/badge/Download-APK-brightgreen?style=for-the-badge&logo=android)](https://github.com/aryannten/Arcade-Hub/releases/tag/v1.0.1)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=flat-square&logo=react)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-000?style=flat-square&logo=expo)
![Tests](https://img.shields.io/badge/Tests-97%20passing-22d3a8?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-a855f7?style=flat-square)

</div>

---

## 📥 Install

Download the latest APK from the [Releases page](https://github.com/aryannten/Arcade-Hub/releases/tag/v1.0.1) and sideload it on any Android device.

> Enable **Install from Unknown Sources** in Android settings if prompted.

---

## 🎮 Games

| Game | Theme | Description |
|------|-------|-------------|
| Memory Match | Purple | Flip cards and match pairs. Tests concentration and recall. |
| Reaction Test | Green | Tap when the screen turns green. Benchmark your reflexes. |
| Number Guesser | Blue | Guess 1–100 in fewest attempts. Binary search in disguise. |
| Rock Paper Scissors | Amber | Classic hand game vs. CPU. |
| Tic Tac Toe | Red | X's and O's — solo or two-player. |
| Snake | Cyan | Eat, grow, avoid walls. Custom food sprite. |
| Flappy Bird | Sky | Tap to fly through pipes. Custom bird sprite, tight controls. |

---

## ✨ Features

- **Stats Tracking** — wins, best scores, fastest times, fewest attempts per game
- **Achievement System** — First Win, Speed Demon, Marathon Player, Perfect Score + more
- **Dark / Light Theme** — one-tap toggle, persists across sessions
- **Fully Offline** — no internet needed after install
- **Haptic Feedback** — responsive haptics on every interaction
- **Search & Filter** — find games by name or difficulty
- **Design System** — comprehensive token system with neon glassmorphism aesthetic
- **Responsive** — optimized for all Android screen sizes

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native 0.81.5 |
| Runtime | Expo SDK 54 |
| UI | React 19.1.0 |
| Storage | @react-native-async-storage/async-storage |
| Gradients | expo-linear-gradient |
| Haptics | expo-haptics |
| Audio | expo-av |
| Testing | Jest + fast-check (property-based) |

---

## 📂 Project Structure

```
Arcade-Hub/
├── App.js                      # Entry point, hub, routing
├── src/
│   ├── components/             # GameCard, InstructionsModal
│   ├── design/
│   │   ├── tokens.js           # Colors, gradients, spacing, typography
│   │   └── components/         # GlassCard, GradientButton, NeonText, StatBar…
│   ├── games/                  # 7 game screens
│   └── utils/
│       ├── storage.js          # AsyncStorage wrapper
│       ├── theme.js            # Theme management
│       ├── sounds.js           # Haptic feedback
│       └── achievements.js     # Achievement engine
├── assets/games/
│   ├── flappy-bird.png         # Bird sprite
│   └── snake-food.png          # Food sprite
└── __tests__/
    ├── unit/
    └── property/               # fast-check property tests
```

---

## 🤝 Contributing

Contributions are welcome. Feel free to:

- Report bugs
- Suggest or add new games
- Improve game logic
- Enhance UI/UX
- Add tests

---

## 📄 License

MIT — open source and free to use.
