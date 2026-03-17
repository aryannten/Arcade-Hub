# Arcade Hub — Android App

Offline mini-games app built with **Expo (React Native)**. Same games as the web version, playable on your phone without an internet connection.

## Run on Android

### Option 1: Expo Go (quickest)

1. Install **Expo Go** from the Play Store on your Android device.
2. From this folder, run:
   ```bash
   npm start
   ```
3. Scan the QR code with Expo Go (Android) or with the Camera app (opens in Expo Go).
4. The app loads and runs **fully offline** after the first open.

### Option 2: Android emulator

1. Install [Android Studio](https://developer.android.com/studio) and set up an AVD.
2. Set `ANDROID_HOME` (e.g. `C:\Users\<You>\AppData\Local\Android\Sdk` on Windows).
3. Run:
   ```bash
   npm run android
   ```

### Option 3: Build an APK (installable offline)

1. Install EAS CLI: `npm i -g eas-cli`
2. Log in: `eas login`
3. Build APK:
   ```bash
   eas build -p android --profile preview
   ```
4. Download the APK from the link EAS gives you and install on your device. No store, no account needed.

## Games

- **Memory Match** — flip and match pairs  
- **Reaction Test** — tap when the screen turns green  
- **Number Guesser** — guess the number  
- **Rock Paper Scissors** — vs computer  
- **Tic Tac Toe** — vs computer or a friend  
- **Snake** — on-screen arrows or swipe  
- **Infinite Racing** — avoid cars, lane switches  
- **Flappy Bird** — tap to fly  
- **Breakout** — drag paddle, tap to launch  

Stats and achievements are stored locally (AsyncStorage). Theme (dark/light) and sound (haptics) can be toggled in the header.

## Tech

- Expo SDK 54, React Native  
- `@react-native-async-storage/async-storage` — local persistence  
- `expo-av` — (optional) audio  
- `expo-haptics` — tap feedback  
- `react-native-safe-area-context` — notches / status bar  

## Project structure

```
mini-games-app/
├── App.js                 # Hub, stats, achievements, routing
├── src/
│   ├── components/        # GameCard, InstructionsModal
│   ├── games/             # All 9 game screens
│   └── utils/             # storage, theme, sounds, achievements
└── ...
```
