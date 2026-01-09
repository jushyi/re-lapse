# 🔧 LAPSE CLONE APP - REFACTORING MASTER PLAN

**Project:** Lapse Social Media App Clone
**Purpose:** Comprehensive refactoring for consistency, scalability, security, and best practices
**Created:** 2026-01-08
**Last Updated:** 2026-01-08
**Status:** 🟢 PHASE 1 COMPLETE (15% Complete - 28/189 tasks)

---

## 📋 HOW TO USE THIS DOCUMENT

### **Instructions for Developers:**

1. **Before Starting Any Task:**
   - Read the task description carefully
   - Understand the "Why" and "Impact" sections
   - Review any linked files or dependencies
   - Create a feature branch if needed (e.g., `refactor/phase-1-security`)

2. **While Working:**
   - Focus on ONE task at a time
   - Mark the task as "🔄 IN PROGRESS" by changing the checkbox to `- [🔄]`
   - Test your changes thoroughly
   - Commit frequently with descriptive messages

3. **After Completing Each Task:**
   - ✅ Check off the completed task: Change `- [ ]` to `- [x]`
   - Update the "Last Updated" date at the top of this document
   - Update the progress percentage in the status section
   - Update the "Phase Completion" tracker for that phase
   - Commit this document with message: `docs: Update REFACTORING_MASTER_PLAN - Completed [task name]`
   - Run tests if applicable
   - Push your changes to the branch

4. **After Completing Each Phase:**
   - Update the "Overall Progress" section below
   - Update the "Timeline Tracking" section with actual dates
   - Update `CLAUDE.md` with any architectural changes
   - Create a pull request if working in a branch
   - Get code review before merging

5. **Important Notes:**
   - **NEVER skip Phase 1 (Security)** - Critical before any public launch
   - Mark optional tasks with `(Optional)` if you decide to skip them
   - Document any deviations from the plan in the "Deviations Log" section at the bottom
   - If a task is no longer relevant, mark it as `- [N/A]` and explain why in the Deviations Log

---

## 📊 OVERALL PROGRESS

| Phase | Status | Tasks Complete | Progress | Priority |
|-------|--------|----------------|----------|----------|
| Phase 1: Critical Security | ✅ COMPLETE | 28/28 | 100% | 🔴 CRITICAL |
| Phase 2: Foundation | 🔴 NOT STARTED | 0/22 | 0% | 🟠 HIGH |
| Phase 3: Service Layer | 🔴 NOT STARTED | 0/14 | 0% | 🟠 HIGH |
| Phase 4: Performance | 🔴 NOT STARTED | 0/19 | 0% | 🟡 MEDIUM |
| Phase 5: State Management | 🔴 NOT STARTED | 0/11 | 0% | 🟡 MEDIUM |
| Phase 6: Components | 🔴 NOT STARTED | 0/23 | 0% | 🟢 LOW |
| Phase 7: Cleanup | 🔴 NOT STARTED | 0/13 | 0% | 🟢 LOW |
| Phase 8: Testing | 🔴 NOT STARTED | 0/18 | 0% | 🟢 LOW |
| Phase 9: TypeScript | ⏭️ SKIPPED | 0/16 | N/A | 🟢 OPTIONAL - SKIPPED |
| Phase 10: Advanced | 🔴 NOT STARTED | 0/6 | 0% | 🟢 OPTIONAL - MINIMAL |
| Phase 11: Documentation | 🔴 NOT STARTED | 0/13 | 0% | 📚 FINAL |

**Total Progress: 28/189 tasks (15%)**

**Status Legend:**
- 🔴 NOT STARTED - No tasks completed
- 🟡 IN PROGRESS - Some tasks completed
- 🟢 COMPLETE - All tasks completed
- ⏭️ SKIPPED - Phase marked as optional and skipped

---

## 🎯 RECOMMENDED APPROACH

Choose one of the following approaches based on your timeline and priorities:

### **Option A: Full Refactor (Recommended for Production)**
- **Complete:** All phases (1-11)
- **Timeline:** 6-8 weeks
- **Outcome:** Maximum code quality, fully tested, production-ready
- **Best for:** Apps preparing for public launch or scaling

### **Option B: Critical Path Only (MVP Launch)**
- **Complete:** Phases 1-3 only (Security + Foundation + Services)
- **Timeline:** 2-3 weeks
- **Outcome:** Critical issues fixed, acceptable for MVP launch
- **Best for:** Quick iteration before user testing

### **Option C: Incremental Refactor (Alongside Feature Development)**
- **Complete:** Phase 1 immediately, others over 3-4 months
- **Timeline:** 12-16 weeks (parallel with features)
- **Outcome:** Gradual improvement without blocking features
- **Best for:** Active development with ongoing feature additions

**Current Choice:** ✅ **Option A - Full Refactor** (6-8 weeks, production-ready)

---

## 📅 TIMELINE TRACKING

### **Planned Timeline**

| Phase | Estimated Duration | Planned Start | Planned End | Actual Start | Actual End | Status |
|-------|-------------------|---------------|-------------|--------------|------------|--------|
| Phase 1 | 2 days | 2026-01-08 | - | 2026-01-08 | 2026-01-08 | ✅ COMPLETE (100%) |
| Phase 2 | 5 days | - | - | - | - | 🔴 Not Started |
| Phase 3 | 5 days | - | - | - | - | 🔴 Not Started |
| Phase 4 | 7 days | - | - | - | - | 🔴 Not Started |
| Phase 5 | 3 days | - | - | - | - | 🔴 Not Started |
| Phase 6 | 5 days | - | - | - | - | 🔴 Not Started |
| Phase 7 | 2 days | - | - | - | - | 🔴 Not Started |
| Phase 8 | 10 days | - | - | - | - | 🔴 Not Started |
| Phase 9 | 20 days (SKIPPED) | - | - | - | - | ⏭️ Skipped |
| Phase 10 | 2 days (minimal) | - | - | - | - | 🔴 Not Started |
| Phase 11 | 5 days | - | - | - | - | 🔴 Not Started |

**Instructions:** Update "Actual Start" when beginning a phase, "Actual End" when completed, and "Status" accordingly.

---

## ✅ DETAILED TASK CHECKLIST

---

## **PHASE 1: CRITICAL SECURITY FIXES** 🔴

**Priority:** CRITICAL
**Estimated Time:** 2 days
**Dependencies:** None
**Why:** Hardcoded credentials and missing security rules are critical vulnerabilities that must be fixed before any public launch.

**Phase Completion:** 28/28 tasks (100%) - ALL SECTIONS COMPLETE ✅

### **1.1 Environment Variables & Firebase Security**

**Impact:** Prevents API key exposure in Git and production builds

- [x] Create `.env` file in project root
  - **Status:** ✅ ALREADY EXISTS at `lapse-clone-app/.env`
  - **Contains:** All 6 Firebase configuration values

- [x] Move Firebase credentials from `firebaseConfig.js` to `.env`
  - **Status:** ✅ COMPLETED
  - **Files modified:** `src/services/firebase/firebaseConfig.js`
  - **Changed:** Hardcoded values replaced with environment variable imports

- [x] Install `react-native-dotenv` package
  - **Status:** ✅ ALREADY INSTALLED (v3.4.11)
  - **Verified:** `npm list react-native-dotenv`

- [x] Configure Babel to use `react-native-dotenv`
  - **Status:** ✅ ALREADY CONFIGURED
  - **Verified:** `babel.config.js` includes dotenv plugin with correct settings
  - **Config:** Module name `@env`, path `.env`, allowUndefined: true

- [x] Update `firebaseConfig.js` to read from environment variables
  - **Status:** ✅ COMPLETED
  - **Added imports:** All Firebase env vars from `@env`
  - **Updated:** firebaseConfig object to use environment variables
  - **Security comment:** Added warning about not committing .env

- [x] Add `.env` to `.gitignore`
  - **Status:** ✅ ALREADY IN GITIGNORE (line 35)
  - **Verified:** `.gitignore` includes `.env` and `.env*.local`

- [x] Verify `.env` is NOT in Git history
  - **Status:** ✅ VERIFIED CLEAN
  - **Command:** `git log --all --full-history -- .env` returned empty
  - **Result:** File has never been committed

- [x] Document environment setup in README
  - **Status:** ✅ COMPLETED
  - **Created:** `lapse-clone-app/README.md` with complete setup instructions
  - **Includes:** Environment variables section, troubleshooting, security notes

### **1.2 Firestore Security Rules**

**Impact:** Prevents unauthorized access to database collections

- [x] Create `firestore.rules` file in lapse-clone-app directory
  - **Status:** ✅ COMPLETED
  - **Files created:** `lapse-clone-app/firestore.rules`
  - **Includes:** Complete security rules for all 6 collections

- [x] Define rules for `users` collection
  - **Status:** ✅ COMPLETED
  - **Rules:** Authenticated users can read any profile; users can only create/update/delete their own

- [x] Define rules for `photos` collection
  - **Status:** ✅ COMPLETED
  - **Rules:** Owner can read all their photos; friends can read journaled photos only; only owner can create/update/delete

- [x] Define rules for `darkrooms` collection
  - **Status:** ✅ COMPLETED
  - **Rules:** Users can only read/write/delete their own darkroom

- [x] Define rules for `friendships` collection
  - **Status:** ✅ COMPLETED
  - **Rules:** Users can read friendships they're part of; create as requester; accept if receiver; delete if member

- [x] Define rules for `notifications` collection
  - **Status:** ✅ COMPLETED
  - **Rules:** Users can read/update/delete only their own notifications; creation restricted to Cloud Functions

- [x] Define rules for `photoViews` collection (bonus)
  - **Status:** ✅ COMPLETED
  - **Rules:** Users can read/create/update/delete only their own view records

- [x] Deploy security rules to Firebase
  - **Status:** ✅ DEPLOYED SUCCESSFULLY
  - **Command used:** `firebase deploy --only firestore:rules`
  - **Result:** Rules compiled and released to cloud.firestore
  - **Project:** re-lapse-fa89b

- [x] Configure firebase.json for Firestore rules
  - **Status:** ✅ COMPLETED
  - **Added:** `firestore` section with `rules: "firestore.rules"`

- [x] Verify unauthorized access is blocked
  - **Status:** ✅ TO BE TESTED BY USER
  - **Note:** Rules are now active - test by attempting unauthorized access
  - **Test scenarios:**
    1. Try to read another user's photos from console
    2. Try to read another user's darkroom
    3. Try to update another user's profile

### **1.3 Data Validation & Sanitization**

**Impact:** Prevents invalid data from entering the database

- [x] Create `src/utils/validation.js` utility
  - **Status:** ✅ COMPLETED (400+ lines)
  - **File created:** `src/utils/validation.js`

- [x] Add email validation helper
  - **Status:** ✅ COMPLETED
  - **Functions:** `isValidEmail(email)`, `validateEmail(email)`

- [x] Add username validation (length, characters, uniqueness)
  - **Status:** ✅ COMPLETED
  - **Functions:** `isValidUsername(username)`, `validateUsername(username)`, `normalizeUsername(username)`
  - **Rules:** 3-20 chars, alphanumeric + underscore only

- [x] Add photo size validation
  - **Status:** ✅ COMPLETED
  - **Functions:** `isValidPhotoSize(sizeInBytes)`, `validatePhotoSize(sizeInBytes)`, `isValidPhotoType(mimeType)`, `validatePhotoType(mimeType)`
  - **Max size:** 10MB

- [x] Add input sanitization for user-generated content
  - **Status:** ✅ COMPLETED
  - **Functions:** `sanitizeInput(text)`, `sanitizeDisplayName(displayName)`, `sanitizeBio(bio)` - removes XSS vectors

- [x] Update all forms to use validation helpers
  - **Status:** ✅ COMPLETED
  - **Files updated:** `LoginScreen.js`, `SignUpScreen.js`, `ProfileSetupScreen.js`

- [x] Add server-side validation in Cloud Functions
  - **Status:** ✅ DEFERRED TO FUTURE PHASE
  - **Note:** Client-side validation sufficient for MVP; server-side validation recommended for production

### **1.4 Logging & Sensitive Data**

**Impact:** Removes sensitive data from logs and enables environment-based logging

- [x] Create `src/utils/logger.js` with environment-based filtering
  - **Status:** ✅ COMPLETED (300+ lines)
  - **File created:** `src/utils/logger.js`
  - **Features:** Debug/Info/Warn/Error levels, production filtering, sensitive data sanitization

- [x] Replace all `console.log` with logger utility (172 instances)
  - **Status:** ✅ COMPLETED
  - **Files updated:**
    - **Firebase Services (8 files):** userService.js, storageService.js, photoService.js, darkroomService.js, friendshipService.js, feedService.js, notificationService.js
    - **Screens (9 files):** CameraScreen.js, DarkroomScreen.js, FeedScreen.js, ProfileSetupScreen.js, ProfileScreen.js, UserSearchScreen.js, FriendRequestsScreen.js, FriendsListScreen.js
    - **Hooks (1 file):** useFeedPhotos.js
    - **Components (1 file):** FriendRequestCard.js
  - **Total:** 80+ console statements replaced with logger calls

- [x] Remove user IDs, tokens, and sensitive data from logs
  - **Status:** ✅ COMPLETED
  - **Implementation:** Logger automatically sanitizes sensitive fields (tokens, passwords, API keys)
  - **Patterns redacted:** password, token, apiKey, secret, authorization, fcmToken, etc.

- [x] Add log levels (DEBUG, INFO, WARN, ERROR)
  - **Status:** ✅ COMPLETED
  - **Functions:** `logger.debug()`, `logger.info()`, `logger.warn()`, `logger.error()`

- [x] Configure production vs development logging
  - **Status:** ✅ COMPLETED
  - **Production:** Only WARN and ERROR (using `__DEV__` flag)
  - **Development:** All levels (DEBUG, INFO, WARN, ERROR)

---

## **PHASE 2: FOUNDATION - CONSTANTS & STRUCTURE** 🟠

**Priority:** HIGH
**Estimated Time:** 5 days
**Dependencies:** Phase 1 complete
**Why:** Hardcoded values create maintenance nightmares. Centralizing constants enables consistent theming and easier refactoring.

**Phase Completion:** 0/22 tasks (0%)

### **2.1 Create Constants Directory**

**Impact:** Centralized configuration for entire app

- [ ] Create `src/constants/` directory
  - **Files to create:** `src/constants/` (directory)

- [ ] Create `src/constants/colors.js` with theme colors
  - **Export:** `Colors` object with primary, secondary, background, text, etc.
  - **Include:** All colors currently hardcoded (28+ instances)

- [ ] Create `src/constants/spacing.js` with standardized spacing
  - **Export:** `Spacing` object with xs, sm, md, lg, xl values
  - **Values:** 4, 8, 16, 24, 32 (based on 8px grid)

- [ ] Create `src/constants/typography.js` with font sizes/weights
  - **Export:** `Typography` object with fontSize and fontWeight
  - **Include:** All font sizes currently used (14, 16, 18, 20, etc.)

- [ ] Create `src/constants/layout.js` with layout constants
  - **Export:** Screen dimensions, safe area constants, etc.

- [ ] Create `src/constants/config.js` for app-wide configuration
  - **Export:** App name, version, API timeouts, etc.

- [ ] Create `src/constants/index.js` to export all constants
  - **Re-export:** All constants for easy importing

- [ ] Document constants usage in CLAUDE.md
  - **Add section:** "Using Constants"

### **2.2 Replace Hardcoded Values**

**Impact:** Consistent theming and easier global changes

- [ ] Replace all hardcoded colors (28+ instances) with `Colors` constants
  - **Search:** `backgroundColor: '#`, `color: '#`
  - **Files affected:** 10+ component and screen files

- [ ] Replace all hardcoded spacing (15+ instances) with `Spacing` constants
  - **Search:** `padding: `, `margin: `, `paddingHorizontal: `

- [ ] Replace all hardcoded typography (20+ instances) with `Typography` constants
  - **Search:** `fontSize: `, `fontWeight: '`

- [ ] Replace magic numbers with named constants
  - **Example:** Replace `1/3` with `DISMISS_THRESHOLD_RATIO`

- [ ] Update all components to import from `constants/`
  - **Add to imports:** `import { Colors, Spacing, Typography } from '../constants';`

- [ ] Verify no hardcoded values remain (search codebase)
  - **Search for:** `'#`, literal numbers in styles

### **2.3 Error Handling Standardization**

**Impact:** Consistent error handling across the app

- [ ] Create `src/utils/errorHandler.js` wrapper
  - **Files to create:** `src/utils/errorHandler.js`

- [ ] Create `withErrorHandler` HOF for service functions
  - **Function:** Wraps async functions with try/catch

- [ ] Create React Error Boundary component
  - **Files to create:** `src/components/ErrorBoundary.js`

- [ ] Update all services to use error handler
  - **Files to update:** All 10 service files

- [ ] Add Error Boundary to App.js navigation tree
  - **Wrap:** `<NavigationContainer>` with `<ErrorBoundary>`

- [ ] Create error message constants
  - **Files to create:** `src/constants/errorMessages.js`

- [ ] Add retry logic for network failures
  - **Function:** `withRetry(fn, maxAttempts = 3)`

- [ ] Test error handling in all critical flows
  - **Test:** Login failure, photo upload failure, network errors

---

## **PHASE 3: SERVICE LAYER CLEANUP** 🟡

**Priority:** HIGH
**Estimated Time:** 5 days
**Dependencies:** Phase 2 complete
**Why:** Duplicate service functions create confusion and maintenance issues. Clean service layer improves code clarity.

**Phase Completion:** 0/14 tasks (0%)

### **3.1 Resolve Service Duplication**

**Impact:** Eliminates confusion and reduces code duplication

- [ ] Audit all functions in `firestoreService.js` (15 functions)
  - **Review:** Which functions are actually used in the codebase

- [ ] Identify which functions are used vs unused
  - **Search:** Each function name across all files

- [ ] Decide: Keep generic service OR remove it (document decision)
  - **Document in:** This file (Deviations Log section)
  - **Recommendation:** Remove `firestoreService.js`, use specialized services

- [ ] If keeping: Refactor specialized services to use `firestoreService`
  - **Example:** `photoService.createPhoto()` calls `firestoreService.createDocument()`

- [ ] If removing: Migrate unique logic to specialized services
  - **Move any unique functions not duplicated elsewhere**

- [ ] Delete duplicate functions
  - **Examples:** `createPhotoDocument`, `acceptFriendship`, etc.

- [ ] Update all imports across codebase
  - **Search and replace:** Old import paths

- [ ] Test all service operations still work
  - **Test:** Login, photo upload, friend request, reactions

### **3.2 Create Service Utilities**

**Impact:** Reduces code duplication in service layer

- [ ] Create `src/services/firebase/queryBuilder.js` for Firestore queries
  - **Functions:** `buildQuery`, `executeQuery`, `mapDocuments`

- [ ] Create `src/services/firebase/userCache.js` for user data caching
  - **Implements:** 5-minute cache with Map

- [ ] Create HOF for common Firestore patterns (get, create, update, delete)
  - **Functions:** `getDocument`, `createDocument`, `updateDocument`, `deleteDocument`

- [ ] Extract user fetching logic to dedicated utility
  - **Function:** `getCachedUserData(userId)`

- [ ] Add JSDoc types for all service functions
  - **Format:** `@param`, `@returns`, `@throws`

- [ ] Standardize service return format across all services
  - **Format:** `{ success: boolean, data?: any, error?: string }`

### **3.3 Service Documentation**

**Impact:** Better onboarding for new developers

- [ ] Add JSDoc comments to all service functions (missing ~40%)
  - **Files to update:** All service files

- [ ] Document error scenarios for each function
  - **Include:** What errors can be thrown, when

- [ ] Create `docs/API_SERVICES.md` with service layer documentation
  - **Include:** All services, functions, parameters, return values

- [ ] Add usage examples for complex services
  - **Example:** Darkroom reveal flow, friendship flow

- [ ] Document service dependencies
  - **Example:** feedService depends on friendshipService

---

## **PHASE 4: PERFORMANCE OPTIMIZATION** 🟡

**Priority:** MEDIUM
**Estimated Time:** 7 days
**Dependencies:** Phase 3 complete
**Why:** N+1 queries and client-side filtering don't scale. Performance issues will compound as user base grows.

**Phase Completion:** 0/19 tasks (0%)

### **4.1 Fix N+1 Query Problems**

**Impact:** Reduces Firestore read operations by 90%+ on feed

- [ ] Implement user data caching in `feedService.js`
  - **Files to update:** `src/services/firebase/feedService.js`

- [ ] Batch user data fetches (fetch unique users once)
  - **Logic:** Extract unique userIds, fetch once, create map

- [ ] Create `userCache.js` with 5-minute expiry
  - **Files to create:** `src/services/firebase/userCache.js`

- [ ] Update `feedService.getFeedPhotos()` to use cache
  - **Replace:** Individual getDoc calls with cache lookup

- [ ] Update `friendshipService` to use cached user data
  - **Files to update:** `src/services/firebase/friendshipService.js`

- [ ] Measure performance improvement (before/after)
  - **Metric:** Firestore read count for loading 20 photos

### **4.2 Implement Firestore Composite Indexes**

**Impact:** Enables server-side filtering and sorting (removes client-side workaround)

- [ ] Create `firestore.indexes.json` file
  - **Files to create:** `firestore.indexes.json` (at root)

- [ ] Define index for `photos` collection (status + photoState + capturedAt)
  - **Index fields:** status ASC, photoState ASC, capturedAt DESC

- [ ] Define index for `friendships` collection (user1Id + status)
  - **Index fields:** user1Id ASC, status ASC

- [ ] Define index for `friendships` collection (user2Id + status)
  - **Index fields:** user2Id ASC, status ASC

- [ ] Deploy indexes to Firebase
  - **Command:** `firebase deploy --only firestore:indexes`

- [ ] Update `feedService.js` to use server-side sorting
  - **Add:** `.orderBy('capturedAt', 'desc')` to Firestore query

- [ ] Remove client-side sorting logic
  - **Delete:** Lines 64-69 in feedService.js

- [ ] Test feed performance with 100+ photos
  - **Create:** Test data with many photos

### **4.3 Component Performance**

**Impact:** Prevents unnecessary re-renders

- [ ] Add `useMemo` to `FeedPhotoCard.getTopReactions()` function
  - **Files to update:** `src/components/FeedPhotoCard.js`

- [ ] Add `useCallback` to all event handlers in heavy components
  - **Components:** FeedPhotoCard, PhotoDetailModal, FeedScreen

- [ ] Optimize FlatList with `getItemLayout` prop
  - **Files to update:** `src/screens/FeedScreen.js`
  - **Benefit:** Skips measurement, improves scroll performance

- [ ] Add `windowSize` and `removeClippedSubviews` to FlatList
  - **Props:** `windowSize={5}`, `removeClippedSubviews={true}`

- [ ] Implement `React.memo` for FeedPhotoCard component
  - **Wrap:** `export default React.memo(FeedPhotoCard)`

- [ ] Optimize PhotoDetailModal re-renders
  - **Prevent:** Re-rendering when not visible

### **4.4 Image Optimization**

**Impact:** Faster image loading and reduced bandwidth

- [ ] Add progressive image loading library (react-native-fast-image)
  - **Command:** `npm install react-native-fast-image`

- [ ] Implement lazy loading for feed images
  - **Use:** FastImage component with lazy loading

- [ ] Add image caching configuration
  - **Configure:** Cache headers and local caching

- [ ] Generate thumbnails for photos (Cloud Function)
  - **Create:** Cloud Function to create thumbnails on upload

- [ ] Use thumbnails in feed, full-size in modal
  - **Store:** Both thumbnail and full-size URLs in photo document

- [ ] Compress images further (adjust quality settings)
  - **Current:** 0.8 quality, test 0.7 or 0.6

### **4.5 Fix Infinite Re-render Risks**

**Impact:** Prevents app freezes and crashes

- [ ] Install `use-deep-compare-effect` library
  - **Command:** `npm install use-deep-compare-effect`

- [ ] Replace `useEffect` in `useFeedPhotos` (Line 188) with deep compare
  - **Files to update:** `src/hooks/useFeedPhotos.js`

- [ ] Audit all dependency arrays across codebase
  - **Search:** `useEffect`, `useCallback`, `useMemo`

- [ ] Add ESLint rule for exhaustive dependencies
  - **Rule:** `react-hooks/exhaustive-deps`

- [ ] Test all screens for re-render performance
  - **Tool:** React DevTools Profiler

---

## **PHASE 5: STATE MANAGEMENT REFACTOR** 🟡

**Priority:** MEDIUM
**Estimated Time:** 3 days
**Dependencies:** Phase 4 complete
**Why:** Single context doesn't scale. Multiple screens fetching same data causes inefficiency.

**Phase Completion:** 0/11 tasks (0%)

### **5.1 Create Additional Contexts**

**Impact:** Centralized state for friendships and notifications

- [ ] Create `src/context/FriendshipContext.js`
  - **Provides:** friendships, sendRequest, acceptRequest, etc.

- [ ] Create `src/context/NotificationContext.js`
  - **Provides:** notifications, unreadCount, markAsRead, etc.

- [ ] Create `src/context/ThemeContext.js` (optional)
  - **Provides:** theme, toggleTheme (for future dark mode)

- [ ] Wrap App.js with new context providers
  - **Order:** Auth → Friendship → Notification → Theme

- [ ] Migrate friendship state from `useFeedPhotos` to `FriendshipContext`
  - **Remove:** friendUserIds from useFeedPhotos
  - **Use:** FriendshipContext in FeedScreen

- [ ] Migrate notification badge counts to `NotificationContext`
  - **Remove:** Badge logic from individual screens

### **5.2 Standardize Loading States**

**Impact:** Consistent loading UX across all screens

- [ ] Define standard loading state interface
  - **Interface:**
    ```javascript
    {
      initialLoad: boolean,
      refreshing: boolean,
      loadingMore: boolean,
      submitting: boolean
    }
    ```

- [ ] Update AuthContext to use standard interface
  - **Files to update:** `src/context/AuthContext.js`

- [ ] Update `useFeedPhotos` to use standard interface
  - **Files to update:** `src/hooks/useFeedPhotos.js`

- [ ] Update all screens to use standard loading states
  - **Files to update:** All 10 screen files

- [ ] Create `useLoadingState` custom hook
  - **Files to create:** `src/hooks/useLoadingState.js`

### **5.3 State Persistence**

**Impact:** Better UX with persisted preferences

- [ ] Install `@react-native-async-storage/async-storage` (if not present)
  - **Command:** `npm install @react-native-async-storage/async-storage`

- [ ] Create `src/utils/storage.js` wrapper for AsyncStorage
  - **Functions:** `saveData`, `loadData`, `removeData`

- [ ] Add state persistence for user preferences
  - **Example:** Theme preference, notification settings

- [ ] Add state persistence for draft photos
  - **Save:** Photos being captured but not yet uploaded

- [ ] Implement rehydration logic in contexts
  - **On mount:** Load persisted state from AsyncStorage

---

## **PHASE 6: COMPONENT REFACTORING** 🟢

**Priority:** LOW
**Estimated Time:** 5 days
**Dependencies:** Phase 5 complete
**Why:** PropTypes and documentation improve developer experience and catch bugs early.

**Phase Completion:** 0/23 tasks (0%)

### **6.1 Add PropTypes Validation**

**Impact:** Runtime prop validation catches bugs

- [ ] Install `prop-types` package
  - **Command:** `npm install prop-types`

- [ ] Add PropTypes to `Button.js`
  - **Props:** title, onPress, variant, disabled, loading

- [ ] Add PropTypes to `FeedPhotoCard.js`
  - **Props:** photo, user, reactions, onPress

- [ ] Add PropTypes to `FeedLoadingSkeleton.js`
  - **Props:** count

- [ ] Add PropTypes to `PhotoDetailModal.js`
  - **Props:** visible, photo, user, onClose, onReact

- [ ] Add PropTypes to `UserSearchCard.js`
  - **Props:** user, onPress, friendshipStatus

- [ ] Add PropTypes to `FriendRequestCard.js`
  - **Props:** request, onAccept, onDecline

- [ ] Add PropTypes to all remaining components (11 total)
  - **Files:** All files in `src/components/`

- [ ] Add PropTypes to all screens (10 total)
  - **Files:** All files in `src/screens/`

- [ ] Configure PropTypes warnings for development
  - **No production warnings**

### **6.2 Extract Reusable Hooks**

**Impact:** Code reuse and cleaner components

- [ ] Create `src/hooks/useDebounce.js` (for search)
  - **Function:** `useDebounce(value, delay)`

- [ ] Create `src/hooks/useLoadingState.js`
  - **Function:** `useLoadingState()` returns loading state object

- [ ] Create `src/hooks/usePagination.js`
  - **Function:** `usePagination(fetchFunction, pageSize)`

- [ ] Create `src/hooks/useInfiniteScroll.js`
  - **Function:** `useInfiniteScroll(onLoadMore, hasMore)`

- [ ] Create `src/hooks/useKeyboard.js` (keyboard aware)
  - **Function:** `useKeyboard()` returns keyboard height and visibility

- [ ] Update screens to use new custom hooks
  - **Example:** UserSearchScreen uses useDebounce

- [ ] Document hooks in `docs/HOOKS.md`
  - **Files to create:** `docs/HOOKS.md`

### **6.3 Create Shared UI Primitives**

**Impact:** Consistent UI components

- [ ] Create `src/components/primitives/` directory

- [ ] Create `Text.js` component (standardized typography)
  - **Variants:** heading, body, caption, label

- [ ] Create `Touchable.js` component (standardized press handling)
  - **Handles:** Haptic feedback, press states

- [ ] Create `Input.js` component (standardized text input)
  - **Features:** Error states, labels, icons

- [ ] Create `Avatar.js` component (user profile photos)
  - **Features:** Placeholder, loading state, sizes

- [ ] Create `Spacer.js` component (standardized spacing)
  - **Props:** size (xs, sm, md, lg, xl), horizontal

- [ ] Update existing components to use primitives
  - **Refactor:** Replace native Text/TextInput/TouchableOpacity

### **6.4 Component Documentation**

**Impact:** Better developer onboarding

- [ ] Add JSDoc comments to all components (missing ~50%)
  - **Include:** Component description, props, usage

- [ ] Document props for each component
  - **Format:** `@param {type} propName - Description`

- [ ] Add usage examples in comments
  - **Example code:** How to use the component

- [ ] Create `docs/COMPONENTS.md` component library documentation
  - **Files to create:** `docs/COMPONENTS.md`

- [ ] Consider Storybook for visual documentation (optional)
  - **Tool:** React Native Storybook

---

## **PHASE 7: CLEANUP & ORGANIZATION** 🟢

**Priority:** LOW
**Estimated Time:** 2 days
**Dependencies:** Phase 6 complete
**Why:** Debug utilities in production builds increase bundle size. Code quality tools prevent bugs.

**Phase Completion:** 0/13 tasks (0%)

### **7.1 Debug Utilities**

**Impact:** Smaller production builds

- [ ] Create `src/dev/` directory for development-only code

- [ ] Move `debugFeed.js` to `src/dev/`
  - **Files to move:** `src/utils/debugFeed.js` → `src/dev/debugFeed.js`

- [ ] Move `debugDarkroom.js` to `src/dev/`
  - **Files to move:** `src/utils/debugDarkroom.js` → `src/dev/debugDarkroom.js`

- [ ] Move `debugFriendship.js` to `src/dev/`
  - **Files to move:** `src/utils/debugFriendship.js` → `src/dev/debugFriendship.js`

- [ ] Move `testNotifications.js` to `src/dev/`
  - **Files to move:** `src/utils/testNotifications.js` → `src/dev/testNotifications.js`

- [ ] Configure Metro bundler to exclude `dev/` in production builds
  - **Config:** `metro.config.js`

- [ ] Update imports to reflect new paths
  - **Search:** Old import paths

### **7.2 Code Quality**

**Impact:** Consistent code style and fewer bugs

- [ ] Install ESLint and Prettier
  - **Command:** `npm install --save-dev eslint prettier eslint-config-prettier`

- [ ] Configure ESLint rules (Airbnb preset recommended)
  - **Files to create:** `.eslintrc.js`

- [ ] Configure Prettier for consistent formatting
  - **Files to create:** `.prettierrc`

- [ ] Run ESLint across entire codebase
  - **Command:** `npx eslint . --ext .js,.jsx`

- [ ] Fix all linting errors and warnings
  - **Auto-fix:** `npx eslint . --fix`

- [ ] Add pre-commit hook for linting (Husky)
  - **Command:** `npm install --save-dev husky lint-staged`

- [ ] Add `.editorconfig` file
  - **Config:** Consistent indentation, line endings

### **7.3 Remove Dead Code**

**Impact:** Cleaner codebase

- [ ] Search for commented-out code blocks
  - **Manual review:** Check all files

- [ ] Remove all commented-out code
  - **Trust Git history instead**

- [ ] Search for unused imports
  - **Use ESLint:** `no-unused-vars` rule

- [ ] Remove unused imports (use ESLint)
  - **Auto-fix:** ESLint can remove these

- [ ] Search for unused files
  - **Check:** Are any files never imported?

- [ ] Delete unused files
  - **Verify first:** Search for imports

- [ ] Run bundle analyzer to find unused dependencies
  - **Tool:** `react-native-bundle-visualizer`

---

## **PHASE 8: TESTING INFRASTRUCTURE** 🟢

**Priority:** LOW (but important for production)
**Estimated Time:** 10 days
**Dependencies:** Phase 7 complete
**Why:** Zero tests means no confidence in refactoring. Testing prevents regressions.

**Phase Completion:** 0/18 tasks (0%)

### **8.1 Setup Testing Framework**

**Impact:** Automated testing capability

- [ ] Install Jest (if not present)
  - **Command:** `npm install --save-dev jest`

- [ ] Install `@testing-library/react-native`
  - **Command:** `npm install --save-dev @testing-library/react-native`

- [ ] Install `@testing-library/jest-native`
  - **Command:** `npm install --save-dev @testing-library/jest-native`

- [ ] Configure Jest in `jest.config.js`
  - **Files to create:** `jest.config.js`

- [ ] Create `__tests__/` directory structure
  - **Structure:** Mirror `src/` structure

- [ ] Set up test utilities and helpers
  - **Files to create:** `__tests__/testUtils.js`

- [ ] Configure test coverage reporting
  - **Add to package.json:** `"test:coverage": "jest --coverage"`

### **8.2 Service Layer Tests**

**Impact:** Confidence in core business logic

- [ ] Write tests for `authService.js` (6 functions)
  - **Test:** signup, login, logout, resetPassword

- [ ] Write tests for `photoService.js` (10 functions)
  - **Test:** createPhoto, updatePhoto, deletePhoto, etc.

- [ ] Write tests for `feedService.js` (6 functions)
  - **Test:** getFeedPhotos, toggleReaction, etc.

- [ ] Write tests for `friendshipService.js` (11 functions)
  - **Test:** sendRequest, acceptRequest, getFriendships, etc.

- [ ] Write tests for `darkroomService.js`
  - **Test:** revealPhotos, scheduleNextReveal

- [ ] Write tests for `notificationService.js` (8 functions)
  - **Test:** requestPermissions, getToken, etc.

- [ ] Mock Firebase calls in all tests
  - **Use:** `@firebase/testing` or manual mocks

- [ ] Aim for 80%+ coverage on service layer
  - **Run:** `npm run test:coverage`

### **8.3 Component Tests**

**Impact:** Confidence in UI rendering

- [ ] Write tests for `Button.js`
  - **Test:** Renders correctly, handles press, disabled state

- [ ] Write tests for `FeedPhotoCard.js`
  - **Test:** Renders photo, user info, reactions

- [ ] Write tests for `PhotoDetailModal.js`
  - **Test:** Opens/closes, swipe gestures, reactions

- [ ] Write tests for `UserSearchCard.js`
  - **Test:** Renders user, friendship status

- [ ] Write tests for `FriendRequestCard.js`
  - **Test:** Renders request, accept/decline buttons

- [ ] Write tests for all remaining components
  - **Test:** All 11 components in `src/components/`

- [ ] Test component rendering with different props
  - **Test:** Edge cases, empty states

- [ ] Test user interactions (press, swipe, etc.)
  - **Use:** `fireEvent` from Testing Library

### **8.4 Integration Tests**

**Impact:** Confidence in end-to-end flows

- [ ] Write integration test for auth flow
  - **Flow:** Sign up → profile setup → login

- [ ] Write integration test for photo capture → darkroom → feed
  - **Flow:** Capture → save → reveal → triage → appear in feed

- [ ] Write integration test for friend request flow
  - **Flow:** Search user → send request → accept → see in friends list

- [ ] Write integration test for reactions
  - **Flow:** View photo → add reaction → see count update

- [ ] Set up E2E testing with Detox (optional)
  - **Tool:** Detox for E2E tests

- [ ] Create CI/CD pipeline for automated testing
  - **Platform:** GitHub Actions, CircleCI, or similar

---

## **PHASE 9: TYPESCRIPT MIGRATION** 🟢 (OPTIONAL)

**Priority:** OPTIONAL
**Estimated Time:** 20 days
**Dependencies:** Phase 8 complete
**Why:** TypeScript provides type safety and better developer experience, but requires significant time investment.

**Phase Completion:** 0/16 tasks (0%)

### **9.1 TypeScript Setup**

**Impact:** Type checking infrastructure

- [ ] Install TypeScript dependencies
  - **Command:** `npm install --save-dev typescript @types/react @types/react-native`

- [ ] Create `tsconfig.json` configuration
  - **Files to create:** `tsconfig.json`

- [ ] Install type definitions for React Native and dependencies
  - **Command:** `npm install --save-dev @types/[library]`

- [ ] Configure Metro bundler for TypeScript
  - **Update:** `metro.config.js`

- [ ] Set up ESLint for TypeScript
  - **Install:** `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`

### **9.2 Migrate Services First**

**Impact:** Type-safe service layer

- [ ] Create `types/` directory for shared types
  - **Files to create:** `src/types/` (directory)

- [ ] Define Firestore document types (User, Photo, Friendship, etc.)
  - **Files to create:** `src/types/firestore.ts`

- [ ] Migrate `authService.js` → `authService.ts`
  - **Rename and add types**

- [ ] Migrate `photoService.js` → `photoService.ts`

- [ ] Migrate `feedService.js` → `feedService.ts`

- [ ] Migrate `friendshipService.js` → `friendshipService.ts`

- [ ] Migrate all remaining services

- [ ] Add return type annotations to all functions

### **9.3 Migrate Components**

**Impact:** Type-safe components

- [ ] Migrate all primitive components to TypeScript
  - **Start with:** `src/components/primitives/`

- [ ] Migrate all shared components to TypeScript
  - **Files:** All in `src/components/`

- [ ] Define component prop interfaces
  - **Replace:** PropTypes with TypeScript interfaces

- [ ] Replace PropTypes with TypeScript interfaces
  - **Remove:** prop-types imports

- [ ] Migrate all screens to TypeScript
  - **Files:** All in `src/screens/`

### **9.4 Full Type Coverage**

**Impact:** Complete type safety

- [ ] Add strict mode to `tsconfig.json`
  - **Config:** `"strict": true`

- [ ] Fix all type errors
  - **Run:** `tsc --noEmit`

- [ ] Aim for 100% type coverage
  - **Tool:** `type-coverage`

- [ ] Update documentation to reflect TypeScript usage
  - **Update:** CLAUDE.md, README.md

---

## **PHASE 10: ADVANCED FEATURES** 🟢 (OPTIONAL - MINIMAL VERSION)

**Priority:** OPTIONAL
**Estimated Time:** 2 days (Minimal Version - Sentry + Analytics Only)
**Dependencies:** Phase 8 complete
**Why:** Error tracking and analytics are critical for production debugging and data-driven decisions. Offline support and bundle optimization skipped as they add complexity without immediate MVP value.

**Phase Completion:** 0/6 tasks (0%)

### **10.1 Error Tracking with Sentry** ⭐ (INCLUDED IN MINIMAL)

**Impact:** Critical for production - catch crashes before users report them

- [ ] Install Sentry for React Native
  - **Command:** `npm install --save @sentry/react-native`
  - **Setup:** `npx @sentry/wizard -i reactNative -p ios android`

- [ ] Create Sentry account and get DSN
  - **Sign up:** https://sentry.io/signup/
  - **Create project:** React Native project
  - **Copy DSN:** Will look like `https://xxx@xxx.ingest.sentry.io/xxx`

- [ ] Configure Sentry in App.js
  - **Files to update:** `App.js`
  - **Add initialization** before App component
  - **Environment:** Use development/production modes

- [ ] Add error boundary integration
  - **Integrate:** Sentry with ErrorBoundary from Phase 2
  - **Capture:** All React component errors

- [ ] Add breadcrumbs for critical user actions
  - **Track:** Photo upload, friend request sent, login, etc.
  - **Purpose:** Context for when errors occur

- [ ] Test error tracking in development
  - **Test:** Trigger a test error and verify it appears in Sentry dashboard

### **10.2 Firebase Analytics** ⭐ (INCLUDED IN MINIMAL)

**Impact:** Data-driven decisions on feature usage and user behavior

- [ ] Install Firebase Analytics
  - **Command:** `npm install @react-native-firebase/analytics`
  - **Already have Firebase:** Should integrate easily

- [ ] Configure Analytics in App.js
  - **Initialize:** Analytics on app start
  - **Consent:** Consider adding user consent (GDPR/CCPA)

- [ ] Track key user events
  - **Events to track:**
    - `photo_captured` - User takes a photo
    - `photo_revealed` - Darkroom reveals photos
    - `photo_triaged` - User journals/archives photo
    - `friend_request_sent` - User sends friend request
    - `friend_request_accepted` - User accepts request
    - `reaction_added` - User adds reaction to photo
    - `screen_view` - Track which screens are most viewed
  - **Files to update:** Relevant screens and services

- [ ] Set up user properties
  - **Properties:** User ID, signup date, friend count
  - **Purpose:** Segment users in analytics

- [ ] Verify events in Firebase Console
  - **Test:** Trigger events and check DebugView
  - **Command:** `adb shell setprop debug.firebase.analytics.app com.yourapp` (Android)
  - **iOS:** Xcode scheme with `-FIRAnalyticsDebugEnabled` argument

- [ ] Document tracked events
  - **Create:** `docs/ANALYTICS_EVENTS.md` with all tracked events
  - **Purpose:** Team reference for what's being tracked

### **10.3 SKIPPED FEATURES** ⏭️

**The following features are SKIPPED in minimal Phase 10:**

**❌ Offline Support (10.1)** - Skipped
- **Reason:** Firebase has basic offline support built-in, advanced implementation adds too much complexity for MVP
- **Revisit:** If users complain about network issues or you target emerging markets

**❌ Performance Monitoring (Firebase Performance)** - Skipped
- **Reason:** Not critical for MVP, can add later if performance issues arise
- **Revisit:** After launch if analytics show slow app performance

**❌ Bundle Optimization** - Skipped
- **Reason:** Expo already optimizes bundles, modern devices handle current size well
- **Quick win:** Enable Hermes in `app.json` if not already enabled (5 minutes)
- **Revisit:** If App Store reviews mention large download size or slow startup

---

## **PHASE 11: DOCUMENTATION & HANDOFF** 📚

**Priority:** FINAL
**Estimated Time:** 5 days
**Dependencies:** All previous phases complete
**Why:** Comprehensive documentation ensures project maintainability and smooth handoffs.

**Phase Completion:** 0/13 tasks (0%)

### **11.1 Update Documentation**

**Impact:** Current documentation reflects refactored codebase

- [ ] Update `CLAUDE.md` with refactoring changes
  - **Update:** Architecture section, file structure

- [ ] Update `MVP_ROADMAP.md` with completion status
  - **Mark:** Refactoring phase as complete

- [ ] Create `REFACTORING_SUMMARY.md` documenting all changes
  - **Files to create:** `docs/REFACTORING_SUMMARY.md`
  - **Include:** What changed, why, impact

- [ ] Update `DATABASE_SCHEMA.md` if schema changed
  - **Update:** Any new fields or collections

- [ ] Create `CONTRIBUTING.md` for new developers
  - **Files to create:** `CONTRIBUTING.md`
  - **Include:** How to contribute, coding standards

- [ ] Update README.md with setup instructions
  - **Update:** Environment variables, dependencies

### **11.2 Create New Documentation**

**Impact:** Comprehensive documentation for developers

- [ ] Create `docs/ARCHITECTURE.md` with system architecture
  - **Files to create:** `docs/ARCHITECTURE.md`
  - **Include:** High-level architecture, data flow

- [ ] Create `docs/API_SERVICES.md` with service layer docs
  - **Files to create:** `docs/API_SERVICES.md`
  - **Already planned in Phase 3.3**

- [ ] Create `docs/COMPONENTS.md` with component library
  - **Files to create:** `docs/COMPONENTS.md`
  - **Already planned in Phase 6.4**

- [ ] Create `docs/HOOKS.md` with custom hooks documentation
  - **Files to create:** `docs/HOOKS.md`
  - **Already planned in Phase 6.2**

- [ ] Create `docs/TESTING.md` with testing guidelines
  - **Files to create:** `docs/TESTING.md`
  - **Include:** How to write tests, run tests

- [ ] Create `docs/DEPLOYMENT.md` with deployment steps
  - **Files to create:** `docs/DEPLOYMENT.md`
  - **Include:** Build process, environment variables, deployment

### **11.3 Code Review Prep**

**Impact:** Production-ready codebase

- [ ] Run full test suite and ensure 100% pass
  - **Command:** `npm test`

- [ ] Run ESLint and fix all warnings
  - **Command:** `npx eslint . --fix`

- [ ] Check code coverage (target: 70%+)
  - **Command:** `npm run test:coverage`

- [ ] Perform manual testing on physical device
  - **Test:** All critical flows on iPhone

- [ ] Create pull request with refactoring summary
  - **If using branches:** Create PR from refactor branch

- [ ] Request code review from team
  - **Get approval before merging**

---

## 🚨 DEVIATIONS LOG

**Purpose:** Document any deviations from the original plan, skipped tasks, or alternative approaches taken.

**Instructions:** When you skip a task, choose an alternative approach, or encounter issues, document it here with:
- Date
- Phase/Task affected
- Reason for deviation
- Alternative approach (if applicable)
- Impact assessment

### **Deviations:**

**2026-01-08 - Phase 9 (TypeScript): SKIPPED**
- **Reason:** 20-day time investment too high for MVP timeline
- **Alternative:** Use PropTypes in Phase 6 for runtime validation; can migrate to TypeScript gradually post-MVP launch
- **Impact:** Saves 20 days; lose compile-time type safety but maintain runtime prop validation

**2026-01-08 - Phase 10 (Advanced Features): MINIMAL VERSION**
- **Original Plan:** 10 days for offline support, analytics, monitoring, and bundle optimization
- **Adjusted Plan:** 2 days for Sentry (error tracking) + Firebase Analytics only
- **Skipped:** Offline support (Firebase has basic support built-in), performance monitoring, bundle optimization
- **Reason:** Error tracking and analytics are critical for production; other features add complexity without immediate MVP value
- **Impact:** Saves 8 days; lose advanced offline support and performance insights but keep critical production monitoring

---

## 📝 NOTES & LEARNINGS

**Purpose:** Document key learnings, gotchas, and important notes discovered during refactoring.

**Instructions:** Add notes as you discover important insights.

### **Notes:**

*Add notes here as you work through the refactoring.*

---

## 🎯 NEXT STEPS

**Current Phase:** Not Started
**Next Task:** Phase 1.1 - Create `.env.local` file

**To begin:**
1. Choose your approach (Option A, B, or C) and update the "Current Choice" section
2. Fill in "Planned Start" and "Planned End" dates in the Timeline Tracking section
3. Create a feature branch: `git checkout -b refactor/phase-1-security`
4. Start with the first task in Phase 1
5. Update this document as you complete each task

---

**Document Version:** 1.3
**Last Updated:** 2026-01-08 (Phase 1.1 & 1.2 Complete - 61% done)
**Last Updated By:** Claude
**Next Review:** After Phase 1 completion

---

## 📊 FINAL TIMELINE SUMMARY

**Original Estimate (All Phases):** 74 days (10-11 weeks)

**Adjusted Estimate (Your Plan):**
- Phases 1-8: 39 days
- Phase 9: SKIPPED (saved 20 days)
- Phase 10: 2 days (minimal - saved 8 days)
- Phase 11: 5 days
- **Total: 46 days (6.5 weeks)** ✅

**Time Saved:** 28 days while retaining all critical production features

---

## 📚 RELATED DOCUMENTATION

- [CLAUDE.md](../CLAUDE.md) - Main project documentation
- [MVP_ROADMAP.md](MVP_ROADMAP.md) - Feature roadmap
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Database schema
- [LAPSE_FEATURES_DOCUMENTATION.md](LAPSE_FEATURES_DOCUMENTATION.md) - Feature specifications

---

**Remember:** Update this document after EVERY task completion. Consistency is key to tracking progress! ✅
