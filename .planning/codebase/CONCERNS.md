# Codebase Concerns

**Analysis Date:** 2026-01-12

## Tech Debt

**Remote Push Notifications Untested:**
- Issue: Push notifications work locally but haven't been tested end-to-end with remote delivery
- Files: `lapse-clone-app/functions/index.js` (Cloud Functions), `lapse-clone-app/src/services/firebase/notificationService.js`
- Why: Expo Go doesn't support remote push notifications (platform limitation)
- Impact: Can't verify notification delivery until standalone build created
- Fix approach: Build standalone development app via EAS Build, test full notification flow (Week 12 priority)

**No Test Coverage:**
- Issue: Zero automated tests for entire codebase (11 weeks of development)
- Files: All `src/**/*.js` files lack corresponding tests
- Why: Focus on MVP feature completion, testing deferred to Week 12
- Impact: Regression risk when making changes, manual testing burden
- Fix approach: Add Jest/Vitest, start with critical path tests (auth, photo lifecycle, feed), aim for 70%+ coverage

**Client-Side Feed Sorting:**
- Issue: Feed photos sorted client-side instead of Firestore query to avoid composite indexes
- Files: `lapse-clone-app/src/services/firebase/feedService.js`, `lapse-clone-app/src/hooks/useFeedPhotos.js`
- Why: Firestore composite indexes require manual creation, client-side sorting is simpler for MVP
- Impact: Performance degradation with 1000+ photos in feed (acceptable for MVP scale)
- Fix approach: Add Firestore composite index on `(photoState, capturedAt DESC)` if scale requires it

**Debug Utilities Not Fully Removed:**
- Issue: Debug utilities were removed (debugFeed, debugFriendship, testNotifications) but may have left console.log statements
- Files: Various throughout `src/screens/*.js` and `src/services/*.js`
- Why: Cleanup completed 2026-01-09, but console.log audit not performed
- Impact: Potential noise in production logs
- Fix approach: Search for `console.log` throughout codebase, replace with logger utility

**ProfileScreen Photo Gallery "Coming Soon":**
- Issue: ProfileScreen photo gallery feature marked as placeholder
- Files: `lapse-clone-app/src/screens/ProfileScreen.js`
- Why: Post-MVP feature, not in Week 1-12 scope
- Impact: Users can't view their own photo history in app (can see in feed only)
- Fix approach: Phase 2 feature - add photo grid query and component

## Known Bugs

**None currently documented** - Week 9 cleanup resolved previous issues (infinite re-render loop, permission errors)

## Security Considerations

**Firestore Security Rules Need Audit:**
- Risk: Security rules may not cover all edge cases (e.g., user modifying another user's photo)
- Files: Firebase Console (Firestore Rules), `lapse-clone-app/docs/DATABASE_SCHEMA.md` documents intended rules
- Current mitigation: Basic rules in place (user can only modify own data)
- Recommendations: Comprehensive security rule audit before production launch (Week 12)

**FCM Tokens Stored Indefinitely:**
- Risk: Expo Push Tokens stored in Firestore never cleaned up (even when user uninstalls)
- Files: `lapse-clone-app/src/services/firebase/notificationService.js` (stores tokens), `users/{userId}/fcmToken` field
- Current mitigation: None (tokens just become invalid over time)
- Recommendations: Add token cleanup on logout or periodic token validation

**No Rate Limiting on Friend Requests:**
- Risk: Users could spam friend requests
- Files: `lapse-clone-app/src/services/firebase/friendshipService.js` (sendFriendRequest function)
- Current mitigation: None (relies on social norms)
- Recommendations: Add Firestore rate limiting via Cloud Functions or client-side throttling

## Performance Bottlenecks

**Real-Time Feed Listeners:**
- Problem: Firestore onSnapshot listener fetches entire feed dataset on every update
- Files: `lapse-clone-app/src/services/firebase/feedService.js` (subscribeFeedPhotos function)
- Measurement: Not measured yet (acceptable for small user base)
- Cause: onSnapshot doesn't support pagination with live updates
- Improvement path: Implement windowed real-time updates or switch to polling for older photos

**Image Compression on Capture:**
- Problem: Photos compressed synchronously on UI thread
- Files: `lapse-clone-app/src/screens/CameraScreen.js` (expo-image-manipulator call)
- Measurement: ~500ms-1s delay on older devices
- Cause: Image manipulation is CPU-intensive
- Improvement path: Move compression to background thread or use Web Worker equivalent

**Feed FlatList with 100+ Photos:**
- Problem: No virtualization limit on FlatList (loads all photos in memory)
- Files: `lapse-clone-app/src/screens/FeedScreen.js` (FlatList component)
- Measurement: Not measured yet (acceptable for MVP)
- Cause: Simple implementation, no pagination limits
- Improvement path: Add pagination limit (load 20 at a time), implement getItemLayout for better performance

## Fragile Areas

**Firebase Cloud Functions (First Deployment):**
- Files: `lapse-clone-app/functions/index.js` (3 notification functions)
- Why fragile: Recently deployed (Week 11), minimal error handling, no retry logic
- Common failures: Expo API rate limits, invalid FCM tokens, network timeouts
- Safe modification: Add comprehensive error logging, implement retry logic with exponential backoff
- Test coverage: Local notification testing only, remote notifications untested

**Photo Reveal Timing Logic:**
- Files: `lapse-clone-app/src/services/firebase/darkroomService.js` (batch reveal system)
- Why fragile: Complex timing logic (0-2 hour random intervals), relies on client-side timer checks
- Common failures: User might miss reveal window if app closed during reveal time
- Safe modification: Test thoroughly with different timezones and app states (background, killed)
- Test coverage: Manual testing only, no automated tests

**Deep Linking Navigation:**
- Files: `lapse-clone-app/src/navigation/AppNavigator.js` (linking config), `lapse-clone-app/App.js` (notification handlers)
- Why fragile: navigationRef routing from notification taps, multiple navigation states
- Common failures: Race condition if app not fully initialized when notification tapped
- Safe modification: Add navigation readiness checks before routing
- Test coverage: Manual testing only

## Scaling Limits

**Firebase Free Tier (Spark Plan):**
- Current capacity: Unlimited Firestore reads/writes, 10GB storage, 360MB/day Cloud Functions
- Limit: ~10k monthly active users estimated before hitting Cloud Functions limit
- Symptoms at limit: Cloud Functions throttled, notification delays
- Scaling path: Upgrade to Blaze (pay-as-you-go), costs ~$25-100/mo for 10k-50k users

**Expo Push Notification Rate Limits:**
- Current capacity: Unknown (Expo doesn't publish limits)
- Limit: ~1000 notifications/hour per project (estimated)
- Symptoms at limit: Notifications queued or dropped
- Scaling path: Batch notifications, use FCM directly instead of Expo API

## Dependencies at Risk

**Firebase SDK 12.7.0:**
- Risk: Major version (v12) released recently (Dec 2024), potential breaking changes in updates
- Impact: Auth, Firestore, Storage, Functions - entire backend could break
- Migration plan: Pin version, test thoroughly before upgrading, follow Firebase migration guides

**Expo SDK 54:**
- Risk: Expo releases new SDK every 3-4 months with breaking changes
- Impact: Camera, notifications, image manipulator could break on upgrade
- Migration plan: Review Expo changelog before upgrading, test all Expo APIs after upgrade

**React Native 0.81.5:**
- Risk: React Native has frequent breaking changes between minor versions
- Impact: Core app functionality could break
- Migration plan: Use Expo's managed upgrade path (expo upgrade), test thoroughly

## Missing Critical Features

**Error Boundaries:**
- Problem: No error boundaries to catch React errors, white screen on crashes
- Current workaround: None (app crashes with blank screen)
- Blocks: User experience suffers on errors, no error reporting
- Implementation complexity: Low (add ErrorBoundary component, wrap root)

**Offline Support:**
- Problem: App requires internet connection for all features (no offline mode)
- Current workaround: Users see loading states or errors when offline
- Blocks: Can't view cached photos offline, can't take photos offline
- Implementation complexity: Medium (implement AsyncStorage caching, queue operations)

**App Icon and Splash Screen:**
- Problem: Using default Expo placeholders
- Current workaround: Default icons work but unprofessional
- Blocks: Can't submit to App Store without custom assets
- Implementation complexity: Low (design assets, add to `assets/` directory) - Week 12 priority

**Comprehensive Error Handling:**
- Problem: Many error cases show generic "Error" alerts without context
- Current workaround: Users see vague error messages
- Blocks: Difficult to debug user-reported issues
- Implementation complexity: Low (improve error messages, add error tracking)

## Test Coverage Gaps

**All Critical Paths Untested:**
- What's not tested: Everything (no test suite exists)
- Risk: Regressions undetected, manual testing burden
- Priority: High (MVP release requires basic testing)
- Difficulty to test: Medium (need to set up Jest, Firebase Emulators, mocks)

**Priority Testing Needs for Week 12:**
1. Auth flow (signup, login, profile setup, session persistence)
2. Photo lifecycle (capture, upload, darkroom reveal, triage)
3. Friend system (send request, accept, decline, remove)
4. Reactions system (toggle reaction, multi-reaction support)
5. Push notifications (permissions, token storage, deep linking)

## Documentation Gaps

**Firebase Security Rules Not Documented:**
- What's missing: Actual deployed Firestore Security Rules not in repo
- Risk: Can't track changes to security rules, no version control
- Priority: Medium
- Implementation: Export rules to `firestore.rules` file, add to git

**Environment Variables Not Documented:**
- What's missing: .env.example file showing required Firebase config
- Risk: New developers don't know what env vars are needed
- Priority: Low (single developer project currently)
- Implementation: Create `.env.example` with placeholder values

**API Documentation:**
- What's missing: No JSDoc comments on service functions
- Risk: Hard to understand function contracts without reading implementation
- Priority: Low (code is relatively self-explanatory)
- Implementation: Add JSDoc comments to all service functions in `src/services/firebase/*.js`

---

*Concerns audit: 2026-01-12*
*Update as issues are fixed or new ones discovered*

**OVERALL ASSESSMENT:** Codebase is in good shape for MVP (11 weeks complete). Main concerns are lack of testing and incomplete remote notification verification. Week 12 focus should be: standalone build → notification testing → basic test coverage → UI polish → TestFlight prep.
