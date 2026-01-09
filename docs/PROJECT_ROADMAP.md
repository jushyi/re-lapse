# Lapse Clone - Complete Project Roadmap

**Project Start Date:** 2026-01-06
**Estimated MVP Completion:** ~10-12 weeks (March 2026)
**Status:** Week 11 Complete - Final Sprint (Week 12)
**Development Approach:** MVP First, then iterate with additional features
**Weekly Time Commitment:** 12 hours/week (significantly ahead of schedule)
**Platform:** iOS Only
**Current Progress:** 91% Complete (11 of 12 weeks done)

---

## 📊 Project Overview

This document serves as the master reference for building a complete clone of the Lapse social media app with all original social features, to be deployed as a private/unlisted app on the Apple App Store.

### Core Features to Implement:
- ✨ Instant camera interface for spontaneous photo capture
- ⏰ Timed photo reveal system (photos "develop" and reveal at set times)
- 👥 Friend connections and social graph
- 💬 Reactions and interactions on photos
- 🔔 Push notifications for reveals and social activity
- 👤 User profiles and authentication
- 📱 Native iOS app experience

---

## 🗓️ Project Phases & Timeline

> **Note:** Timeline estimates will be added once tech stack and scope are finalized.

### Phase 1: Research & Planning
**Estimated Duration:** TBD
**Status:** Not Started

- [ ] Research Lapse app features and UI/UX (camera-first social media with delayed photo reveal)
- [ ] Document core features: instant camera, timed photo reveals, friend connections, reactions, profiles
- [ ] Choose tech stack (React Native for iOS/Android, backend framework, database)
- [ ] Set up project requirements document
- [ ] Plan database schema (users, photos, friends, reactions, notifications)
- [ ] Design API endpoints specification
- [ ] Create wireframes/mockups for key screens
- [ ] Define authentication & privacy requirements

**Key Deliverables:**
- Feature specification document
- Tech stack decision
- Database schema design
- API specification
- UI/UX wireframes

---

### Phase 2: Development Environment Setup
**Estimated Duration:** TBD
**Status:** Not Started

- [ ] Install Node.js and npm/yarn
- [ ] Install React Native CLI and dependencies
- [ ] Set up Expo (if using Expo) or bare React Native project
- [ ] Initialize Git repository
- [ ] Create `.gitignore` for sensitive files
- [ ] Set up project folder structure (components, screens, services, utils)
- [ ] Install core dependencies (navigation, state management, camera, image handling)
- [ ] Configure environment variables (.env setup)
- [ ] Set up ESLint and Prettier for code quality

**Key Deliverables:**
- Initialized React Native project
- Git repository configured
- Development environment ready
- Code quality tools configured

---

### Phase 3: Backend Setup
**Estimated Duration:** TBD
**Status:** Not Started

- [ ] Choose backend (Node.js/Express, Python/Django, Python/FastAPI, or Firebase)
- [ ] Initialize backend project structure
- [ ] Set up database (PostgreSQL, MongoDB, or Firebase Firestore)
- [ ] Configure database connection and ORM/ODM
- [ ] Set up authentication system (JWT or Firebase Auth)
- [ ] Create user model/schema
- [ ] Create photo model/schema (with timed reveal metadata)
- [ ] Create friendship/connection model/schema
- [ ] Create reaction model/schema
- [ ] Create notification model/schema
- [ ] Set up cloud storage for photos (AWS S3, Google Cloud Storage, or Firebase Storage)
- [ ] Configure CORS and security middleware
- [ ] Set up API rate limiting
- [ ] Create health check endpoint

**Key Deliverables:**
- Backend server running
- Database configured and connected
- Cloud storage setup
- Basic API structure ready

---

### Phase 4: Authentication & User Management
**Estimated Duration:** TBD
**Status:** Not Started

- [ ] Build user registration API endpoint
- [ ] Build user login API endpoint
- [ ] Build password reset flow (backend)
- [ ] Build user profile update endpoint
- [ ] Build user search/discovery endpoint
- [ ] Implement JWT token generation and validation
- [ ] Create authentication middleware
- [ ] Build signup screen (frontend)
- [ ] Build login screen (frontend)
- [ ] Build forgot password screen (frontend)
- [ ] Implement secure token storage (AsyncStorage/SecureStore)
- [ ] Create authentication context/state management
- [ ] Build profile setup screen (username, bio, profile photo)
- [ ] Implement profile photo upload functionality

**Key Deliverables:**
- Complete authentication system
- User registration and login flows
- Profile management functionality

---

### Phase 5: Camera & Photo Capture
**Estimated Duration:** TBD
**Status:** Not Started

- [ ] Install and configure react-native-camera or expo-camera
- [ ] Build camera screen UI (Lapse-style instant camera interface)
- [ ] Implement photo capture functionality
- [ ] Add camera flip (front/back) functionality
- [ ] Add flash toggle functionality
- [ ] Implement photo preview before posting
- [ ] Add photo filters/effects (if applicable to Lapse)
- [ ] Build photo upload to cloud storage
- [ ] Implement photo compression before upload
- [ ] Create loading states during upload
- [ ] Handle camera permissions (iOS/Android)

**Key Deliverables:**
- Functional camera interface
- Photo capture and upload system
- Camera permissions handling

---

### Phase 6: Timed Photo Reveal System
**Estimated Duration:** TBD
**Status:** Not Started

- [ ] Design timed reveal logic (photos revealed at specific times daily)
- [ ] Build backend job scheduler (cron jobs or task queue)
- [ ] Create photo scheduling API endpoint
- [ ] Implement photo visibility rules based on time
- [ ] Build countdown timer UI for next reveal
- [ ] Create push notification system for photo reveals
- [ ] Build "developing" animation/state for unrevealed photos
- [ ] Implement photo reveal feed/timeline
- [ ] Add pull-to-refresh for feed
- [ ] Handle timezone differences for global users

**Key Deliverables:**
- Timed reveal system (core feature)
- Photo scheduling backend
- Countdown and reveal UI
- Push notifications for reveals

---

### Phase 7: Social Features - Friends & Connections
**Estimated Duration:** TBD
**Status:** Not Started

- [ ] Build friend request send API endpoint
- [ ] Build friend request accept/decline endpoints
- [ ] Build friends list API endpoint
- [ ] Build user search functionality (backend)
- [ ] Create friend suggestions algorithm (optional)
- [ ] Build add friends screen (search users)
- [ ] Build friend requests screen (pending/received)
- [ ] Build friends list screen
- [ ] Implement friend request notifications
- [ ] Add remove friend functionality
- [ ] Build block user functionality (backend + frontend)

**Key Deliverables:**
- Friend connection system
- User search and discovery
- Friend request workflows

---

### Phase 8: Social Features - Reactions & Interactions
**Estimated Duration:** TBD
**Status:** Not Started

- [ ] Design reaction types (emoji reactions like Lapse)
- [ ] Build add reaction API endpoint
- [ ] Build remove reaction endpoint
- [ ] Build get reactions for photo endpoint
- [ ] Implement reaction UI on photos
- [ ] Add reaction picker/selector
- [ ] Build comments system (if applicable)
- [ ] Create comment API endpoints
- [ ] Build comment UI components
- [ ] Implement real-time updates for reactions (WebSocket or polling)
- [ ] Add notification for reactions on your photos

**Key Deliverables:**
- Reaction system on photos
- Comments (if applicable)
- Real-time interaction updates

---

### Phase 9: Feed & Discovery
**Estimated Duration:** TBD
**Status:** Not Started

- [ ] Build main feed API (friends' photos)
- [ ] Implement feed pagination/infinite scroll
- [ ] Build feed screen UI
- [ ] Add photo detail view/modal
- [ ] Implement swipe gestures for navigation
- [ ] Build discover/explore feed (public or suggested users)
- [ ] Add pull-to-refresh on feeds
- [ ] Implement photo caching for performance
- [ ] Add loading skeletons/placeholders
- [ ] Handle empty states (no friends, no photos)

**Key Deliverables:**
- Main photo feed
- Photo detail views
- Discovery/explore functionality

---

### Phase 10: User Profile
**Estimated Duration:** TBD
**Status:** Not Started

- [ ] Build user profile API endpoint (view others' profiles)
- [ ] Build own profile API endpoint
- [ ] Create profile screen UI
- [ ] Display user's photo grid/history
- [ ] Show friend count and mutual friends
- [ ] Add edit profile functionality
- [ ] Implement settings screen
- [ ] Build privacy settings (public/private account)
- [ ] Add notification preferences
- [ ] Implement logout functionality
- [ ] Add account deletion option

**Key Deliverables:**
- User profile screens
- Profile editing
- Settings and privacy controls

---

### Phase 11: Notifications
**Estimated Duration:** 12 hours planned
**Actual Duration:** 2h 40m (10 hours ahead!)
**Status:** ✅ Complete (2026-01-08)

- [x] Set up push notification service (Firebase Cloud Messaging + Expo)
- [x] Build notification storage in database (users/{userId}/fcmToken)
- [x] Create notification service (notificationService.js with 8 functions)
- [x] Implement push notifications for friend requests
- [x] Implement push notifications for reactions
- [x] Implement push notifications for photo reveals
- [x] Deploy Cloud Functions (3 functions to Firebase production)
- [x] Add notification badges/counts (handled by iOS)
- [x] Handle notification permissions (iOS permission flow)
- [x] Implement notification deep linking to relevant screens
- [x] Test local notifications thoroughly
- ⏳ Remote notification testing deferred to Phase 13 (requires standalone build)

**Key Deliverables:**
- ✅ Push notification system (complete)
- ✅ Cloud Functions deployed
- ✅ Deep linking to relevant content
- ✅ notificationService.js (243 lines)
- ✅ functions/index.js (340 lines)
- ✅ Test utilities created
- ✅ Comprehensive documentation (11+ docs)

---

### Phase 12: Real-time Features (Optional but Recommended)
**Estimated Duration:** TBD
**Status:** Not Started

- [ ] Set up WebSocket server (Socket.io or native WebSockets)
- [ ] Implement real-time friend activity indicators
- [ ] Add real-time reaction updates
- [ ] Implement typing indicators for comments (if applicable)
- [ ] Add online/offline status indicators

**Key Deliverables:**
- WebSocket infrastructure
- Real-time activity updates

---

### Phase 13: Polish & UX Enhancements
**Estimated Duration:** 12 hours
**Status:** 🔜 Next Up (Week 12)

- [ ] Build standalone development app (EAS Build)
- [ ] Test remote notifications end-to-end
- [ ] Implement haptic feedback for interactions
- [ ] Add smooth animations and transitions
- [ ] Build splash screen and app icon
- [ ] Create onboarding flow for new users (optional for MVP)
- [ ] Add loading states across all screens
- [ ] Implement error boundaries
- [ ] Implement error handling and user-friendly error messages
- [ ] Add pull-to-refresh across relevant screens (already done)
- [ ] Optimize image loading and caching
- [ ] Implement keyboard avoiding views for forms
- [ ] Add form validation and inline error messages (mostly done)
- [ ] Performance testing and optimization
- [ ] Comprehensive bug fixes
- [ ] Prepare for TestFlight distribution

**Key Deliverables:**
- Polished UI/UX
- Smooth animations
- Comprehensive error handling
- Remote notifications verified
- Production-ready standalone build
- MVP ready for TestFlight

---

### Phase 14: Testing
**Estimated Duration:** TBD
**Status:** Not Started

- [ ] Write unit tests for critical backend functions
- [ ] Write API integration tests
- [ ] Test authentication flows thoroughly
- [ ] Test photo upload and reveal timing
- [ ] Test friend request workflows
- [ ] Test notification delivery
- [ ] Perform iOS device testing (multiple devices/iOS versions)
- [ ] Test camera functionality on real devices
- [ ] Test push notifications on real devices
- [ ] Perform security testing (auth, data privacy)
- [ ] Test app performance and memory usage
- [ ] Fix bugs identified during testing

**Key Deliverables:**
- Test suite for backend
- Comprehensive manual testing
- Bug fixes and stability improvements

---

### Phase 15: iOS Deployment Preparation
**Estimated Duration:** TBD
**Status:** Not Started

- [ ] Create Apple Developer account ($99/year)
- [ ] Generate iOS certificates and provisioning profiles
- [ ] Configure app bundle identifier
- [ ] Set up App Store Connect app record
- [ ] Prepare app icon (all required sizes)
- [ ] Create launch screen/splash screen
- [ ] Build iOS release version
- [ ] Test iOS build on physical devices
- [ ] Configure app permissions in Info.plist (camera, notifications, photos)
- [ ] Set up backend production environment
- [ ] Configure production database
- [ ] Set up production cloud storage
- [ ] Configure environment variables for production
- [ ] Set up SSL/HTTPS for backend API
- [ ] Implement backend monitoring and logging

**Key Deliverables:**
- iOS release build
- Production backend deployed
- Apple Developer account setup
- App Store Connect configured

---

### Phase 16: App Store Submission (Unlisted/Private)
**Estimated Duration:** TBD
**Status:** Not Started

- [ ] Prepare app screenshots (required sizes for App Store)
- [ ] Write app description and keywords
- [ ] Create privacy policy URL (required by Apple)
- [ ] Create terms of service (optional but recommended)
- [ ] Set app to "Unlisted" in App Store Connect
- [ ] Configure age rating appropriately
- [ ] Submit app for App Review
- [ ] Respond to any App Review feedback/rejections
- [ ] Once approved, make app available as unlisted
- [ ] Share direct App Store link with intended users

**Key Deliverables:**
- App Store submission complete
- App approved and available (unlisted)
- Distribution link for users

---

### Phase 17: Documentation & Handoff
**Estimated Duration:** TBD
**Status:** Not Started

- [ ] Document API endpoints (Swagger/Postman collection)
- [ ] Create README with setup instructions
- [ ] Document environment variables needed
- [ ] Write deployment guide for backend
- [ ] Document database schema
- [ ] Create user guide/help documentation
- [ ] Document known limitations or future enhancements
- [ ] Set up backup strategy for database

**Key Deliverables:**
- Complete technical documentation
- User guides
- Deployment documentation

---

### Phase 18: Monitoring & Maintenance
**Estimated Duration:** Ongoing
**Status:** Not Started

- [ ] Set up error tracking (Sentry, Bugsnag)
- [ ] Implement analytics (optional - Firebase Analytics, Mixpanel)
- [ ] Monitor backend performance and uptime
- [ ] Set up automated database backups
- [ ] Create maintenance plan for updates
- [ ] Monitor App Store review/rating (if applicable)

**Key Deliverables:**
- Monitoring systems in place
- Backup strategy active
- Maintenance plan documented

---

## 🛠️ Technology Stack Decisions

> **Status:** ✅ FINALIZED - Option A (Fast Development)

### Frontend (Mobile App):
- **Framework:** React Native with Expo (Managed Workflow)
- **Language:** JavaScript/TypeScript
- **State Management:** Context API + AsyncStorage (simple, built-in)
- **Navigation:** React Navigation
- **Camera:** expo-camera
- **Image Handling:** expo-image-picker, expo-image-manipulator
- **Secure Storage:** expo-secure-store

### Backend:
- **Framework:** Firebase (Backend-as-a-Service)
  - Firebase Authentication (email/password + phone optional)
  - Cloud Firestore (NoSQL database)
  - Firebase Cloud Storage (photo storage)
  - Firebase Cloud Functions (timed reveal logic, notifications)
- **Alternative if needed:** Python FastAPI for custom backend
- **API Style:** Firebase SDK (real-time) or RESTful API if custom backend

### Database:
- **Primary Database:** Firebase Firestore (NoSQL, real-time, scalable)
- **Caching:** Built into Firebase SDK

### Cloud Services:
- **Photo Storage:** Firebase Cloud Storage
- **Push Notifications:** Firebase Cloud Messaging (FCM) + Apple Push Notification Service (APNs)
- **Hosting:** Firebase Hosting (for privacy policy, terms of service)
- **Backend Functions:** Firebase Cloud Functions (Node.js)

### DevOps:
- **Version Control:** Git + GitHub
- **CI/CD:** Expo EAS Build & Submit (built-in)
- **Error Tracking:** Sentry (free tier)
- **Analytics:** Firebase Analytics (optional, free tier)

### Development Environment:
- **OS:** Windows (with iOS testing via Expo Go app on physical iPhone)
- **Build Service:** Expo EAS (builds iOS app in cloud, no Mac required!)
- **Testing:** Expo Go app for development, TestFlight for production testing

---

## 📋 Prerequisites & Requirements

### Required Accounts:
- [ ] Apple Developer Account ($99/year) - **Required for App Store deployment**
- [ ] Cloud hosting account (AWS, Google Cloud, etc.)
- [ ] Cloud storage account for photos
- [ ] Domain for backend API (optional but recommended)

### Required Software (will be installed in Phase 2):
- Node.js and npm/yarn
- React Native development tools
- Xcode (for iOS development on Mac)
- Git
- Code editor (VS Code recommended)
- Backend runtime (Python or Node.js)

### Required Knowledge:
- React Native basics
- Backend development (Python or Node.js)
- RESTful API design
- Database design
- iOS app deployment process

---

## 💰 Estimated Costs

### One-Time Costs:
- Apple Developer Account: $99/year
- Domain name (optional): ~$10-15/year

### Monthly Recurring Costs (estimates):
- Cloud hosting (backend): $10-50/month (depends on usage)
- Cloud storage (photos): $5-30/month (depends on usage)
- Database hosting: $0-25/month (may be included in hosting)
- Push notification service: $0 (Firebase free tier likely sufficient)

**Total Estimated Monthly Cost:** $15-100/month (varies by usage and provider)

---

## ⚠️ Critical Decisions Needed Before Starting

Before we can begin Phase 2, the following decisions must be made:

1. **Tech Stack Selection:**
   - React Native: Expo or CLI?
   - Backend: Python (Django/FastAPI) or Node.js (Express)?
   - Database: PostgreSQL, MongoDB, or Firebase?
   - Cloud provider: AWS, Google Cloud, or Firebase?

2. **Feature Scope:**
   - Are we building ALL original Lapse features, or MVP first?
   - Which features are must-haves vs. nice-to-haves?
   - Any additional features beyond original Lapse?

3. **Development Resources:**
   - Solo developer or team?
   - Available time commitment (hours per week)?
   - Development machine: Mac (required for iOS), Windows, or both?

4. **Deployment Timeline:**
   - Target launch date?
   - Phased rollout or all-at-once?

---

## 📞 Decision Log

This section will track all major decisions made during the project.

| Date | Decision | Rationale | Impact |
|------|----------|-----------|--------|
| TBD  | Tech stack selection | TBD | Foundation for entire project |
| TBD  | Feature scope | TBD | Determines project timeline |

---

## 🚀 Next Steps

1. **Answer clarifying questions** about Lapse features and tech preferences
2. **Finalize tech stack** decisions
3. **Update timeline estimates** based on decisions
4. **Begin Phase 2:** Development Environment Setup

---

## 📝 Notes & Assumptions

- This is a substantial project requiring significant development effort
- Estimated timeline will be added once tech stack and scope are finalized
- Private/unlisted App Store deployment requires Apple Developer account
- Backend costs will scale with number of users
- Real-time features (WebSocket) add complexity but greatly improve UX
- App Review can take 1-3 days (sometimes longer) - factor into timeline

---

**Last Updated:** 2026-01-08
**Document Version:** 1.1
**Status:** Week 11 Complete - 91% MVP Progress
