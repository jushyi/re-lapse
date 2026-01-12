# External Integrations

**Analysis Date:** 2026-01-12

## APIs & External Services

**Push Notifications:**
- Expo Push Notification API - Remote push notifications
  - SDK/Client: expo-notifications 0.32.16
  - Auth: Expo Push Tokens generated and stored in Firestore (`users/{userId}/fcmToken`)
  - Delivery: Triggered by Firebase Cloud Functions, delivered via Expo API

## Data Storage

**Databases:**
- Firebase Cloud Firestore - Primary NoSQL database
  - Connection: Via firebase SDK (config in .env)
  - Client: firebase 12.7.0 (modular SDK v9+)
  - Collections: `users/`, `photos/`, `darkrooms/`, `friendships/`, `notifications/`, `photoViews/`
  - Security: Firestore Security Rules enforce access control

**File Storage:**
- Firebase Cloud Storage - User-uploaded photos
  - SDK/Client: firebase 12.7.0 (Storage module)
  - Auth: Firebase Auth token (automatic with SDK)
  - Buckets: Default Firebase Storage bucket for photo uploads
  - Upload location: `lapse-clone-app/src/services/firebase/photoService.js`

**Caching:**
- AsyncStorage - Local client-side caching
  - Client: @react-native-async-storage/async-storage 2.2.0
  - Usage: Auth session persistence, user profile caching
  - Location: `lapse-clone-app/src/context/AuthContext.js`

## Authentication & Identity

**Auth Provider:**
- Firebase Authentication - Email/password + Apple Sign-In
  - Implementation: firebase SDK Auth module
  - Token storage: AsyncStorage for session persistence
  - Session management: Firebase Auth handles JWT refresh automatically
  - Location: `lapse-clone-app/src/services/firebase/authService.js`

**OAuth Integrations:**
- Apple Sign-In - Social sign-in for iOS
  - Credentials: Configured in Firebase Console
  - Scopes: email, profile
  - Implementation: Firebase Auth Apple provider

## Cloud Functions

**Firebase Cloud Functions:**
- Serverless backend for notifications and scheduled tasks
  - Runtime: Node.js 20 (deployed to us-central1 region)
  - Triggers: Firestore document events (onCreate, onUpdate)
  - Functions deployed:
    - `sendPhotoRevealNotification` - Triggered on darkroom updates
    - `sendFriendRequestNotification` - Triggered on friendship creation
    - `sendReactionNotification` - Triggered on photo reaction updates
  - Location: `lapse-clone-app/functions/index.js`

## Monitoring & Observability

**Error Tracking:**
- None currently (planned: Sentry or similar)

**Analytics:**
- None currently (planned: Firebase Analytics or Mixpanel)

**Logs:**
- Firebase Functions logs - View via Firebase Console
- Expo logs - Development console output
- Custom logging: `lapse-clone-app/src/utils/logger.js` (environment-aware structured logging)

## CI/CD & Deployment

**Hosting:**
- Expo Application Services (EAS) - App builds and distribution
  - Project ID: b7da185a-d3e1-441b-88f8-0d4379333590
  - Owner: spoods
  - Deployment: Manual builds via EAS CLI
  - Target: iOS (TestFlight), Android (Google Play)

**CI Pipeline:**
- Not detected (no GitHub Actions, CircleCI, etc. configured)
- Manual build and deployment workflow

**Firebase Functions Deployment:**
- Manual deployment via `firebase deploy --only functions`
- Deployed to us-central1 region

## Environment Configuration

**Development:**
- Required env vars: Firebase config (API keys, project ID, etc.)
- Secrets location: `.env` file (gitignored), referenced via react-native-dotenv
- Mock/stub services: Firebase Emulators (optional, not currently configured)
- Testing: Expo Go for rapid iteration, physical device for full features

**Staging:**
- Not detected (single Firebase project for dev/prod)

**Production:**
- Secrets management: `.env` for Firebase config (not committed)
- Firebase project: Production Firestore, Auth, Storage, Functions
- Distribution: EAS Build → TestFlight (iOS) / Google Play (Android)

## Webhooks & Callbacks

**Incoming:**
- None (no external webhook endpoints)

**Outgoing:**
- Firebase Cloud Functions → Expo Push Notification API
  - Endpoint: Expo Push API (https://exp.host/--/api/v2/push/send)
  - Trigger: Firestore document events (photo reveals, friend requests, reactions)
  - Retry logic: Expo API handles retries

## Deep Linking

**Scheme:**
- lapse:// - Custom URL scheme for app navigation
  - Configuration: `lapse-clone-app/src/navigation/AppNavigator.js`
  - Routes:
    - `lapse://darkroom` - Navigate to Darkroom tab (photo reveals)
    - `lapse://friends/requests` - Navigate to Friend Requests screen
    - `lapse://feed` - Navigate to Feed tab (reactions)

## Secure Storage

**Expo SecureStore:**
- expo-secure-store ~15.0.8 - Encrypted local storage for sensitive data
  - Platform: iOS Keychain, Android Keystore
  - Usage: Potential future use for tokens (currently using AsyncStorage)

---

*Integration audit: 2026-01-12*
*Update when adding/removing external services*
