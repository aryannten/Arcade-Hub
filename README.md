<div align="center">

# Arcade Hub

**Your pocket-sized gaming paradise**

A collection of 9 classic mini-games built with React Native and Expo. Play offline, track your stats, unlock achievements, and enjoy a beautiful dark/light theme experience.

[![Download APK](https://img.shields.io/badge/Download-APK-brightgreen?style=for-the-badge&logo=android)](https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest)

[Features](#features) • [Games](#games) • [Installation](#installation) • [Tech Stack](#tech-stack) • [Project Structure](#project-structure)

</div>

---

## Quick Download

**Want to try it right away?**

Download the latest APK from our [Releases page](https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest) and install it on your Android device.

> Note: You may need to enable "Install from Unknown Sources" in your Android settings.

---

## Features

- **9 Classic Games** — Memory Match, Reaction Test, Number Guesser, Rock Paper Scissors, Tic Tac Toe, Snake, Infinite Racing, Flappy Bird, and Breakout
- **Fully Offline** — Play anywhere, no internet required after first load
- **Stats Tracking** — Track your performance across all games with detailed statistics
- **Achievement System** — Unlock achievements as you play and master each game
- **Dark/Light Theme** — Switch between themes with a single tap
- **Haptic Feedback** — Feel every tap and action with responsive haptics
- **Search & Filter** — Find games quickly by name or difficulty level
- **Responsive Design** — Optimized for all Android screen sizes

## Games

### Memory Match
**Difficulty:** Medium  
Flip cards and match pairs. Test your memory and concentration skills.

### Reaction Test
**Difficulty:** Easy  
Tap when the screen turns green! How fast are your reflexes?

### Number Guesser
**Difficulty:** Easy  
Guess the secret number between 1-100. Can you do it in the fewest attempts?

### Rock Paper Scissors
**Difficulty:** Easy  
Classic hand game against the computer. Best of luck!

### Tic Tac Toe
**Difficulty:** Hard  
Strategic X's and O's. Play against the computer or challenge a friend.

### Snake
**Difficulty:** Medium  
Eat food, grow longer, avoid walls. The classic arcade experience.

### Infinite Racing
**Difficulty:** Hard  
Dodge obstacles and switch lanes. How far can you go?

### Flappy Bird
**Difficulty:** Hard  
Tap to fly through pipes. Timing is everything!

### Breakout
**Difficulty:** Medium  
Break bricks with your paddle. Clear all levels!

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (optional, but recommended)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/aryannten/Arcade-Hub
   cd mini-games-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

### Running on Android

#### Option 1: Expo Go (Fastest)

1. Install **Expo Go** from the Google Play Store
2. Run `npm start` in your project directory
3. Scan the QR code with Expo Go or your camera app
4. The app will load and run fully offline after the first open

#### Option 2: Android Emulator

1. Install [Android Studio](https://developer.android.com/studio)
2. Set up an Android Virtual Device (AVD)
3. Set `ANDROID_HOME` environment variable
   - Windows: `C:\Users\<YourUsername>\AppData\Local\Android\Sdk`
   - macOS/Linux: `~/Library/Android/sdk`
4. Run:
   ```bash
   npm run android
   ```

#### Option 3: Build APK

Build a standalone APK for distribution:

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Build APK
eas build -p android --profile preview
```

Download the APK from the provided link and install it on your device.

## Tech Stack

- **Framework:** React Native 0.81.5
- **Runtime:** Expo SDK 54
- **UI:** React 19.1.0
- **Storage:** @react-native-async-storage/async-storage
- **Haptics:** expo-haptics
- **Audio:** expo-av
- **Safe Area:** react-native-safe-area-context

## Project Structure

```
Arcade-Hub
/
├── App.js                      # Main app entry, hub, routing
├── index.js                    # Expo entry point
├── app.json                    # Expo configuration
├── eas.json                    # EAS Build configuration
├── package.json                # Dependencies
├── assets/                     # App icons and splash screens
│   ├── icon.png
│   ├── splash-icon.png
│   ├── adaptive-icon.png
│   └── favicon.png
└── src/
    ├── components/             # Reusable UI components
    │   ├── GameCard.jsx        # Game selection card
    │   └── InstructionsModal.jsx # Help modal
    ├── games/                  # Individual game screens
    │   ├── index.js            # Game exports
    │   ├── MemoryGame.jsx
    │   ├── ReactionTest.jsx
    │   ├── NumberGuesser.jsx
    │   ├── RockPaperScissors.jsx
    │   ├── TicTacToe.jsx
    │   ├── Snake.jsx
    │   ├── InfiniteRacing.jsx
    │   ├── FlappyBird.jsx
    │   └── Breakout.jsx
    └── utils/                  # Utility modules
        ├── storage.js          # AsyncStorage wrapper
        ├── theme.js            # Theme management
        ├── sounds.js           # Haptic feedback
        └── achievements.js     # Achievement system
```

## Features in Detail

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
Beautiful dark and light themes:
- Smooth transitions
- Consistent color palette
- Optimized for readability
- Persistent theme selection

## Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator/device
npm run ios        # Run on iOS simulator (macOS only)
npm run web        # Run in web browser
```

## Screenshots

> Add your app screenshots here to showcase the UI

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new games
- Improve existing games
- Enhance UI/UX
- Add new features

## License

This project is open source and available under the MIT License.

## Future Enhancements

- [ ] Multiplayer support
- [ ] Online leaderboards
- [ ] More games
- [ ] Custom themes
- [ ] Sound effects
- [ ] Game tutorials
- [ ] Social sharing

---

<div align="center">

**Made with React Native and Expo**

Star this repo if you like it!

</div>
