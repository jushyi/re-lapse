# Technology Stack

**Analysis Date:** 2026-01-12

## Languages

**Primary:**
- JavaScript/JSX - React Native components (all .js files in `lapse-clone-app/src/`)

**Configuration:**
- JSON - Configuration files (`package.json`, `app.json`)

## Runtime

**Environment:**
- React Native 0.81.5 - Mobile runtime
- React 19.1.0 - UI library
- Node.js (for development and Expo tooling)

**Package Manager:**
- npm - Package management
- Lockfile: package-lock.json (if present)

**Platform:**
- Expo SDK ~54.0.30 - Managed workflow for React Native
- iOS and Android target platforms

## Frameworks

**Core:**
- React Native 0.81.5 - Cross-platform mobile framework
- Expo ~54.0.30 - Development and build tooling
- React Navigation 7.x - Navigation stack and tabs
  - `@react-navigation/native` 7.1.26
  - `@react-navigation/native-stack` 7.9.0
  - `@react-navigation/bottom-tabs` 7.9.0

**Backend-as-a-Service:**
- Firebase 12.7.0 - Backend services (Auth, Firestore, Storage, Functions)

**Testing:**
- Not detected (no test framework configured in package.json)

**Build/Dev:**
- Expo CLI - Development server and builds
- Babel (babel-preset-expo 54.0.9) - JavaScript transpilation
- EAS (Expo Application Services) - Production builds (project ID: b7da185a-d3e1-441b-88f8-0d4379333590)

## Key Dependencies

**Critical:**
- firebase 12.7.0 - Backend services (Auth, Firestore, Storage, Cloud Functions)
- expo-camera ~17.0.10 - Camera access for photo capture
- expo-notifications ~0.32.16 - Push notifications system
- @react-native-async-storage/async-storage 2.2.0 - Local storage for session persistence

**UI/Navigation:**
- react-native-gesture-handler ~2.28.0 - Gesture system
- react-native-reanimated ~3.16.1 - Animations
- react-native-safe-area-context ~5.6.0 - Safe area handling
- react-native-screens ~4.16.0 - Native screen primitives

**Media Processing:**
- expo-image-manipulator ~14.0.8 - Image compression and resizing
- expo-image-picker ~17.0.10 - Gallery access
- react-native-svg 15.12.1 - SVG rendering

**Device Features:**
- expo-haptics ~15.0.8 - Haptic feedback
- expo-device ~8.0.10 - Device information
- expo-secure-store ~15.0.8 - Secure credential storage

**Utilities:**
- date-fns 4.1.0 - Date formatting and manipulation

## Configuration

**Environment:**
- react-native-dotenv 3.4.11 - Environment variable management
- Configuration via `.env` files (for Firebase config)
- Expo configuration in `app.json` (app metadata, permissions, plugins)

**Build:**
- app.json - Expo app configuration (bundle ID, permissions, plugins)
- package.json - Dependencies and scripts
- babel.config.js - Babel transpilation (likely present)

**Permissions:**
- iOS: Camera permission (`expo-camera` plugin)
- Android: Camera, edge-to-edge display (`app.json`)

## Platform Requirements

**Development:**
- macOS/Linux/Windows (any platform with Node.js and Expo CLI)
- iOS Simulator or Android Emulator for testing
- Physical iOS/Android device for full testing (camera, notifications)
- Expo Go app for rapid development (limited push notification support)

**Production:**
- iOS: Standalone build via EAS Build, distributed through TestFlight/App Store
- Android: Standalone build via EAS Build, distributed through Google Play
- Requires EAS account (owner: spoods, projectId: b7da185a-d3e1-441b-88f8-0d4379333590)

---

*Stack analysis: 2026-01-12*
*Update after major dependency changes*
