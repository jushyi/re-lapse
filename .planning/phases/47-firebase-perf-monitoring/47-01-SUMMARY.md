---
phase: 47-firebase-perf-monitoring
plan: 01
subsystem: infra
tags: [firebase, performance-monitoring, react-native-firebase, perf, traces]

# Dependency graph
requires:
  - phase: 46-performance-optimization
    provides: Firebase SDK infrastructure (@react-native-firebase/app ^23.8.2, expo-dev-client, withFirebaseFix plugin)
provides:
  - '@react-native-firebase/perf SDK installed and configured'
  - 'withTrace() async wrapper for custom code traces'
  - 'useScreenTrace() hook for screen load timing'
  - 'initPerformanceMonitoring() called at app startup'
affects: [47-02, 47-03, 48-ui-ux-consistency-audit]

# Tech tracking
tech-stack:
  added: ['@react-native-firebase/perf ^23.8.6']
  patterns:
    [
      'withTrace() wrapper for async operation tracing',
      'useScreenTrace() hook for screen-to-data-ready timing',
      '__DEV__ guard pattern for perf monitoring no-ops',
    ]

key-files:
  created: ['src/services/firebase/performanceService.js', 'src/hooks/useScreenTrace.js']
  modified:
    ['package.json', 'app.json', 'firebase.json', 'src/services/firebase/index.js', 'App.js']

key-decisions:
  - 'Use custom code traces via startTrace(), not startScreenTrace() (iOS crashes)'
  - 'Skip trace creation entirely in __DEV__ with no-op stub to prevent polluting production metrics'
  - 'Reserve 1 of 5 custom attribute slots for success/failure tracking'

patterns-established:
  - 'withTrace(name, operation, attributes): Guaranteed stop() in finally block, success attribute, __DEV__ no-op'
  - 'useScreenTrace(screenName): Mount-start, markLoaded-stop pattern with unmount cleanup'

issues-created: []

# Metrics
duration: 4min
completed: 2026-02-11
---

# Phase 47 Plan 01: SDK & Core Utilities Summary

**@react-native-firebase/perf SDK installed with withTrace() async wrapper, useScreenTrace() hook, and App.js initialization with **DEV** collection guard**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-11T00:01:27Z
- **Completed:** 2026-02-11T00:05:53Z
- **Tasks:** 2
- **Files modified:** 7 (2 created, 5 modified)

## Accomplishments

- Installed @react-native-firebase/perf SDK (v23.8.6) with Expo config plugin, firebase.json auto-collection config
- Created performanceService.js with `initPerformanceMonitoring()` and `withTrace()` — guaranteed trace.stop() in finally block, **DEV** no-op with stub trace, up to 4 custom attributes with 1 reserved for success
- Created useScreenTrace.js hook — mount-start / markLoaded-stop pattern with unmount-before-load cleanup
- Wired up barrel exports and App.js module-level initialization after existing initializeGiphy call

## Task Commits

Each task was committed atomically:

1. **Task 1: Install SDK and update configuration files** - `5a007d7` (feat)
2. **Task 2: Create performance service, screen trace hook, and App.js initialization** - `0bf2997` (feat)

**Plan metadata:** `5dc9d01` (docs: complete plan)

## Files Created/Modified

- `package.json` - Added @react-native-firebase/perf ^23.8.6 dependency
- `package-lock.json` - Auto-updated by npm install
- `app.json` - Added @react-native-firebase/perf to plugins array after auth, before withFirebaseFix
- `firebase.json` - Added react-native.perf_auto_collection_enabled: true
- `src/services/firebase/performanceService.js` - NEW: initPerformanceMonitoring() + withTrace() exports
- `src/hooks/useScreenTrace.js` - NEW: useScreenTrace(screenName) hook with markLoaded callback
- `src/services/firebase/index.js` - Added barrel exports for perf utilities
- `App.js` - Added initPerformanceMonitoring() call at module level

## Decisions Made

- Used custom code traces (`perf().startTrace()`) instead of `startScreenTrace()` per research finding that iOS crashes with screen traces
- **DEV** guard disables collection and skips trace creation entirely (no-op stubs) to prevent polluting production metrics
- Attribute limit enforced at 4 custom + 1 reserved for success, with string truncation at 100 chars

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- Core perf infrastructure ready for service/screen instrumentation in plans 02 and 03
- withTrace() ready to wrap Firestore operations, image loading, auth flows
- useScreenTrace() ready to instrument screen load times across the app
- Requires `npx expo prebuild --clean` before next native build (new Expo config plugin added)

---

_Phase: 47-firebase-perf-monitoring_
_Completed: 2026-02-11_
