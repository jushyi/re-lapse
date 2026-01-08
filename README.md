# Lapse Clone App

A friends-only, disposable camera-inspired social media app built with React Native and Expo.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Expo Go app on physical device

### Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd lapse-clone-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the project root with your Firebase credentials:

   ```env
   FIREBASE_API_KEY=your_api_key_here
   FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   FIREBASE_PROJECT_ID=your_project_id_here
   FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   FIREBASE_APP_ID=your_app_id_here
   ```

   **⚠️ IMPORTANT:** Never commit the `.env` file to Git! It's already included in `.gitignore`.

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device**
   - **iOS:** Press `i` to open iOS simulator
   - **Android:** Press `a` to open Android emulator
   - **Physical Device:** Scan the QR code with Expo Go app

## 🔧 Environment Variables

This project uses `react-native-dotenv` to manage environment variables securely.

### How It Works
- Environment variables are stored in the `.env` file (NOT committed to Git)
- They're loaded at build time via Babel configuration
- Accessed in code via `import { VARIABLE_NAME } from '@env'`

### Required Environment Variables
| Variable | Description |
|----------|-------------|
| `FIREBASE_API_KEY` | Firebase project API key |
| `FIREBASE_AUTH_DOMAIN` | Firebase authentication domain |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket URL |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `FIREBASE_APP_ID` | Firebase app ID |

### Changing Environment Variables
After modifying `.env`, you MUST restart the Expo development server with cache cleared:
```bash
npx expo start --clear
```

## 📱 Features

- **Authentication:** Email/password signup, login, Apple Sign-In
- **Camera:** Instant camera interface with front/back toggle and flash control
- **Darkroom System:** Batch photo reveals (0-2 hour random intervals)
- **Feed:** Real-time feed of friends' photos with reactions
- **Friends System:** Send/accept friend requests, friends-only content
- **Reactions:** Multi-emoji reaction system
- **Push Notifications:** Photo reveals, friend requests, reactions

## 📚 Documentation

- **[CLAUDE.md](../docs/CLAUDE.md)** - Comprehensive project documentation
- **[MVP_ROADMAP.md](../docs/MVP_ROADMAP.md)** - Feature development roadmap
- **[DATABASE_SCHEMA.md](../docs/DATABASE_SCHEMA.md)** - Firestore database schema
- **[REFACTORING_MASTER_PLAN.md](../docs/REFACTORING_MASTER_PLAN.md)** - Refactoring checklist and timeline

## 🏗️ Project Structure

```
lapse-clone-app/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components
│   ├── navigation/       # Navigation configuration
│   ├── context/          # React Context (AuthContext)
│   ├── services/         # Firebase services
│   │   └── firebase/     # All Firebase-related services
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   └── constants/        # App constants (coming in refactor)
├── App.js               # Root component
├── babel.config.js      # Babel configuration (includes dotenv plugin)
└── package.json         # Dependencies
```

## 🔐 Security

- **Environment Variables:** Firebase credentials stored in `.env` (not committed)
- **Firestore Rules:** Database security rules configured (see Firebase Console)
- **Authentication:** All main screens require authentication
- **Input Validation:** User input validated client-side

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 📦 Build

### Development Build
```bash
npx expo start
```

### Production Build
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## 🐛 Troubleshooting

### Environment variables not loading
1. Make sure `.env` file exists in the project root
2. Restart Expo with cleared cache: `npx expo start --clear`
3. Verify `babel.config.js` includes `react-native-dotenv` plugin

### Firebase errors
1. Check that all environment variables are set correctly
2. Verify Firebase project configuration in Firebase Console
3. Ensure Firestore security rules are deployed

### Build errors
1. Clear node modules: `rm -rf node_modules && npm install`
2. Clear Expo cache: `npx expo start --clear`
3. Clear Metro cache: `npx react-native start --reset-cache`

## 📄 License

Private project - not for distribution

## 👥 Contributors

- Your Name - Initial work

---

**Need help?** Check the [CLAUDE.md](../docs/CLAUDE.md) documentation or create an issue.
