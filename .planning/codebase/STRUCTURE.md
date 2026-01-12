# Codebase Structure

**Analysis Date:** 2026-01-12

## Directory Layout

```
lapse-clone-app/
├── assets/              # App icons, splash screens
├── docs/                # Project documentation
├── functions/           # Firebase Cloud Functions
├── src/                 # Application source code
│   ├── components/      # Reusable UI components
│   ├── constants/       # App constants
│   ├── context/         # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── navigation/      # Navigation configuration
│   ├── screens/         # Screen components
│   ├── services/        # Business logic & Firebase
│   │   └── firebase/    # Firebase service modules
│   └── utils/           # Helper functions
├── App.js               # Root component
├── app.json             # Expo configuration
├── package.json         # Dependencies and scripts
└── README.md            # Setup instructions
```

## Directory Purposes

**assets/**
- Purpose: Static resources (images, icons, fonts)
- Contains: App icon, splash screen, adaptive icons
- Key files: `icon.png`, `splash-icon.png`, `adaptive-icon.png`, `favicon.png`
- Subdirectories: None

**docs/**
- Purpose: Project documentation for development
- Contains: Markdown documentation files
- Key files:
  - `MVP_ROADMAP.md` - Feature roadmap and sprint planning
  - `LAPSE_FEATURES_DOCUMENTATION.md` - Feature specifications
  - `DATABASE_SCHEMA.md` - Firestore data models
  - `PROJECT_ROADMAP.md` - High-level project timeline
  - `WEEK_*_PLAN.md`, `WEEK_*_SUMMARY.md`, `WEEK_*_COMPLETE.md` - Sprint documentation
  - `LOGGING_IMPLEMENTATION_GUIDE.md` - Logging standards
- Subdirectories: None

**functions/**
- Purpose: Firebase Cloud Functions (serverless backend)
- Contains: Node.js functions for notifications and scheduled tasks
- Key files:
  - `index.js` - Function definitions (3 notification functions)
  - `package.json` - Function dependencies
  - `README.md` - Deployment and testing guide
- Subdirectories: None (flat structure)

**src/components/**
- Purpose: Reusable UI components
- Contains: React Native components used across multiple screens
- Key files:
  - `FeedPhotoCard.js` - Photo display card for feed
  - `FeedLoadingSkeleton.js` - Loading placeholder
  - `PhotoDetailModal.js` - Full-screen photo viewer with reactions
  - `UserSearchCard.js` - User search result item
  - `FriendRequestCard.js` - Friend request list item
  - `index.js` - Barrel export
- Subdirectories: None

**src/constants/**
- Purpose: App-wide constants
- Contains: Configuration values, color schemes
- Key files: Not specified in docs (likely minimal)
- Subdirectories: None

**src/context/**
- Purpose: React Context providers for global state
- Contains: AuthContext for authentication state
- Key files: `AuthContext.js` - User authentication and profile state
- Subdirectories: None

**src/hooks/**
- Purpose: Custom React hooks for reusable stateful logic
- Contains: useFeedPhotos hook
- Key files: `useFeedPhotos.js` - Feed data management (loading, pagination, real-time updates)
- Subdirectories: None

**src/navigation/**
- Purpose: React Navigation configuration
- Contains: Navigator definitions and deep linking setup
- Key files: `AppNavigator.js` - Main navigation tree (Auth Stack, Main Tabs, Friends Stack)
- Subdirectories: None

**src/screens/**
- Purpose: Full-screen components (one per route)
- Contains: All app screens
- Key files:
  - Auth: `LoginScreen.js`, `SignUpScreen.js`, `ProfileSetupScreen.js`
  - Main Tabs: `FeedScreen.js`, `CameraScreen.js`, `DarkroomScreen.js`, `FriendsListScreen.js`, `ProfileScreen.js`
  - Friends: `UserSearchScreen.js`, `FriendRequestsScreen.js`
- Subdirectories: None (flat structure)

**src/services/firebase/**
- Purpose: Firebase operations and business logic
- Contains: Service modules for each domain
- Key files:
  - `firebaseConfig.js` - Firebase SDK initialization
  - `authService.js` - Authentication (signup, login, logout, profile setup)
  - `photoService.js` - Photo upload, lifecycle management
  - `darkroomService.js` - Batch reveal system
  - `feedService.js` - Feed queries, reactions
  - `friendshipService.js` - Friend requests, relationships (11 core functions)
  - `notificationService.js` - Push notification handling (8 core functions)
- Subdirectories: None

**src/utils/**
- Purpose: Helper functions and utilities
- Contains: Logging, time formatting, haptics, debug tools
- Key files:
  - `logger.js` - Structured logging with sanitization
  - `timeUtils.js` - Date formatting (getTimeAgo, formatDate)
  - `haptics.js` - Haptic feedback wrapper
  - `debugFeed.js` - Feed debugging utilities (REMOVED in cleanup)
  - `debugFriendship.js` - Friendship debugging (REMOVED in cleanup)
  - `debugDarkroom.js` - Darkroom debugging (REMOVED in cleanup)
  - `testNotifications.js` - Notification testing (REMOVED in cleanup)
- Subdirectories: None

## Key File Locations

**Entry Points:**
- `App.js` - App root, AuthContext provider, notification setup
- `src/navigation/AppNavigator.js` - Navigation root

**Configuration:**
- `app.json` - Expo configuration (bundle ID, permissions, plugins, EAS project)
- `package.json` - Dependencies, scripts
- `src/services/firebase/firebaseConfig.js` - Firebase SDK initialization
- `.env` - Environment variables (Firebase keys, gitignored)

**Core Logic:**
- `src/services/firebase/*.js` - All business logic
- `src/context/AuthContext.js` - Global auth state
- `src/hooks/useFeedPhotos.js` - Feed state management

**Testing:**
- No test directory (testing not implemented yet)

**Documentation:**
- `CLAUDE.md` - Development guide for Claude AI
- `docs/*.md` - Sprint plans, summaries, schemas
- `functions/README.md` - Cloud Functions documentation

## Naming Conventions

**Files:**
- PascalCase for React components: `FeedScreen.js`, `PhotoDetailModal.js`, `AuthContext.js`
- camelCase for services and utilities: `authService.js`, `feedService.js`, `timeUtils.js`
- kebab-case for documentation: `WEEK_11_COMPLETE.md`, `MVP_ROADMAP.md`

**Directories:**
- lowercase for all directories: `components/`, `services/`, `utils/`
- Plural names for collections: `screens/`, `hooks/`, `functions/`

**Special Patterns:**
- `index.js` for barrel exports: `src/components/index.js`
- `*Service.js` for Firebase service modules
- `*Screen.js` for screen components
- `*Context.js` for React Context providers

## Where to Add New Code

**New Screen:**
- Primary code: `src/screens/NewScreen.js`
- Navigation: Update `src/navigation/AppNavigator.js` to add route
- Tests: No testing setup yet (future: `src/screens/__tests__/`)

**New Component:**
- Implementation: `src/components/NewComponent.js`
- Export: Add to `src/components/index.js` barrel
- Tests: No testing setup yet

**New Firebase Service:**
- Implementation: `src/services/firebase/newService.js`
- Pattern: Export functions (module pattern, not class)
- Usage: Import in screens or hooks

**New Utility:**
- Shared helpers: `src/utils/newUtil.js`
- Pattern: Export named functions

**New Context Provider:**
- Implementation: `src/context/NewContext.js`
- Integration: Wrap in `App.js` if global, or in specific navigator

**New Hook:**
- Implementation: `src/hooks/useNewHook.js`
- Pattern: Custom hook returning state and functions

**New Cloud Function:**
- Implementation: Add to `functions/index.js`
- Deploy: `firebase deploy --only functions`
- Test: Follow `functions/README.md` guide

## Special Directories

**functions/**
- Purpose: Firebase Cloud Functions source code
- Source: Deployed to Firebase via `firebase deploy --only functions`
- Committed: Yes (source of truth)
- Runtime: Node.js 20, deployed to us-central1 region

**docs/**
- Purpose: Development documentation (not user-facing)
- Source: Manually created and updated during sprints
- Committed: Yes (project documentation)

**assets/**
- Purpose: Static assets bundled with app
- Source: Created manually or generated
- Committed: Yes (part of app bundle)

**src/tmpclaude-* (if present)**
- Purpose: Temporary working directories created by Claude Code
- Source: Auto-generated during development
- Committed: No (should be gitignored)

---

*Structure analysis: 2026-01-12*
*Update when directory structure changes*
