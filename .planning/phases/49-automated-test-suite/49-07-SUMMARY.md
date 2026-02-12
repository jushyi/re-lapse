---
phase: 49-automated-test-suite
plan: 07
subsystem: testing
tags: [maestro, e2e, testID, yaml, react-native]

# Dependency graph
requires:
  - phase: 49-06
    provides: Cloud Functions test suite complete
provides:
  - Maestro E2E directory structure and config
  - Auth screen testIDs for E2E targeting
  - Phone login and onboarding E2E YAML flows
affects: [49-08-maestro-e2e-critical-flows, 50-ci-cd-pipeline]

# Tech tracking
tech-stack:
  added: [maestro (YAML only, CLI for CI)]
  patterns: [testID naming convention (screen-element), Maestro YAML flow structure]

key-files:
  created:
    [
      .maestro/config.yaml,
      .maestro/auth/phone-login.yaml,
      .maestro/auth/onboarding.yaml,
      .maestro/feed/view-feed.yaml,
      .maestro/social/friend-request.yaml,
    ]
  modified:
    [
      src/components/Button.js,
      src/components/AuthCodeInput.js,
      src/screens/PhoneInputScreen.js,
      src/screens/VerificationScreen.js,
      src/screens/ProfileSetupScreen.js,
      src/screens/SelectsScreen.js,
      src/screens/ContactsSyncScreen.js,
      src/screens/NotificationPermissionScreen.js,
    ]

key-decisions:
  - 'Skip Maestro CLI install on Windows — YAML files written for CI execution on macOS runners (Phase 50)'
  - 'testID naming: screen-element pattern (e.g., phone-input, verification-code-input)'
  - 'Adapted testIDs for actual screen names (PhoneInputScreen, not LoginScreen/SignupScreen)'

patterns-established:
  - 'testID convention: kebab-case, screen-element pattern'
  - 'Maestro flow structure: appId header, launchApp with clearState, testID-based targeting'

issues-created: []

# Metrics
duration: 9min
completed: 2026-02-12
---

# Phase 49 Plan 07: Maestro E2E Setup & Auth Flow Summary

**Maestro E2E test infrastructure with auth/onboarding YAML flows and testIDs across 6 auth/onboarding screens**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-12T17:09:06Z
- **Completed:** 2026-02-12T17:17:53Z
- **Tasks:** 3 (2 auto + 1 checkpoint)
- **Files modified:** 13

## Accomplishments

- Created `.maestro/` directory structure with global config (appId: com.spoodsjs.rewind)
- Added 11 testIDs across 6 auth/onboarding screens (PhoneInput, Verification, ProfileSetup, Selects, ContactsSync, NotificationPermission)
- Wrote phone-login.yaml E2E flow using Firebase test phone number (+16505553434 / code 123456)
- Wrote onboarding.yaml E2E flow covering full critical path through all 4 onboarding screens
- Updated Button and AuthCodeInput shared components to pass through testID prop

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Maestro and create E2E directory structure** - `6b5a2fe` (chore)
2. **Task 2: Add testIDs to auth screens and write auth E2E flows** - `2db7cf5` (feat)

## Files Created/Modified

- `.maestro/config.yaml` - Global Maestro config with appId
- `.maestro/auth/phone-login.yaml` - Phone auth E2E flow
- `.maestro/auth/onboarding.yaml` - Full onboarding critical path E2E flow
- `.maestro/feed/view-feed.yaml` - Placeholder for feed E2E flow
- `.maestro/social/friend-request.yaml` - Placeholder for social E2E flow
- `src/components/Button.js` - Added testID prop passthrough
- `src/components/AuthCodeInput.js` - Added testID prop passthrough
- `src/screens/PhoneInputScreen.js` - Added phone-input, phone-continue-button testIDs
- `src/screens/VerificationScreen.js` - Added verification-code-input, verification-submit-button testIDs
- `src/screens/ProfileSetupScreen.js` - Added profile-display-name-input, profile-username-input, profile-next-button testIDs
- `src/screens/SelectsScreen.js` - Added selects-complete-button testID
- `src/screens/ContactsSyncScreen.js` - Added contacts-skip-button testID
- `src/screens/NotificationPermissionScreen.js` - Added notifications-enable-button, notifications-skip-button testIDs

## Decisions Made

- Skipped Maestro CLI installation on Windows — YAML files written for CI execution on macOS runners in Phase 50
- Adapted testID naming for actual screen names: plan referenced LoginScreen/SignupScreen/VerificationCodeScreen but actual files are PhoneInputScreen (handles both login/signup) and VerificationScreen
- Used `screen-element` kebab-case naming pattern for testIDs (e.g., `phone-input`, `verification-code-input`)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Screen file name mismatch**

- **Found during:** Task 2 (testID additions)
- **Issue:** Plan referenced LoginScreen.js, SignupScreen.js, VerificationCodeScreen.js but actual files are PhoneInputScreen.js (handles both login/signup) and VerificationScreen.js
- **Fix:** Adapted testID names to actual screens: `phone-input`/`phone-continue-button` instead of `login-phone-input`/`login-continue-button`
- **Files modified:** src/screens/PhoneInputScreen.js, src/screens/VerificationScreen.js
- **Verification:** testIDs present in correct screens
- **Committed in:** 2db7cf5

**2. [Rule 3 - Blocking] Button and AuthCodeInput testID passthrough**

- **Found during:** Task 2 (testID additions)
- **Issue:** Button and AuthCodeInput components did not accept or forward testID props — testIDs set on these components would be silently ignored
- **Fix:** Added testID to props destructuring and forwarded to underlying TouchableOpacity (Button) and Pressable (AuthCodeInput)
- **Files modified:** src/components/Button.js, src/components/AuthCodeInput.js
- **Verification:** testID prop now reaches native elements for Maestro targeting
- **Committed in:** 2db7cf5

---

**Total deviations:** 2 auto-fixed (1 file naming mismatch, 1 blocker), 0 deferred
**Impact on plan:** Both fixes necessary for correct testID targeting. No scope creep.

## Issues Encountered

None

## Next Phase Readiness

- Maestro E2E infrastructure ready for 49-08 (critical flows: feed, camera, social)
- testID pattern established for future screen instrumentation
- YAML files ready for CI execution on macOS runners (Phase 50)

---

_Phase: 49-automated-test-suite_
_Completed: 2026-02-12_
