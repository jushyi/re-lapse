# Lapse Clone - Camera/Darkroom UX Refactor

## What This Is

A comprehensive UI/UX refactor of the Camera and Darkroom experience in the Lapse social media clone app, now with phone-only authentication. This consolidates the two separate tabs into a unified camera experience with native iOS gestures for photo triage, a press-and-hold reveal interaction, visual consistency across all camera controls, and streamlined phone-based sign-in.

## Core Value

Seamless, native-feeling photo capture and reveal experience that combines the camera and darkroom into one intuitive flow with smooth iOS gestures, haptic feedback, and frictionless phone authentication.

## Current State (v1.2 Shipped)

**Shipped:** 2026-01-19
**Execution time:** 6.4 hours total (v1.1: 4.3h + v1.2: 2.1h)
**Phases:** 8 phases, 16 plans across both milestones

The Phone Authentication milestone is complete. Users now experience:
- Phone-only authentication with SMS verification (no email/password)
- Real-time phone number formatting as they type
- Auto-submit verification code when 6 digits entered
- Clear error feedback with shake animations and retry delays
- ErrorBoundary protection against white-screen crashes
- Custom app icon (minimalist "L") and splash screen (LAPSE branding)

Previous v1.1 features remain:
- Single camera tab with darkroom button (badge shows developing/revealed count)
- Press-and-hold to reveal photos with progress bar and haptic milestones
- Swipe gestures for triage (left=Archive, right=Journal) like iOS Mail
- Celebration page with confetti after completing triage
- Polished SVG icons matching the app's design system

## Requirements

### Validated

**v1.2 Phone Authentication:**
- ✓ Phone-only authentication with SMS verification — v1.2
- ✓ React Native Firebase for native phone auth — v1.2
- ✓ Phone number validation with libphonenumber-js — v1.2
- ✓ Country code picker (15 common countries) — v1.2
- ✓ Auto-submit verification when 6 digits entered — v1.2
- ✓ Real-time phone number formatting (AsYouType) — v1.2
- ✓ Remove email/password and Apple Sign-In — v1.2
- ✓ ErrorBoundary for crash resilience — v1.2
- ✓ Custom app icon and splash screen — v1.2

**v1.1 Camera/Darkroom UX:**
- ✓ Remove Darkroom tab from bottom navigation, keep Camera tab only — v1.1
- ✓ Add darkroom button on left side of capture button in CameraScreen — v1.1
- ✓ Darkroom button disabled/greyed out when no photos ready to reveal — v1.1
- ✓ Darkroom button opens bottom sheet with "press and hold to reveal" UI — v1.1
- ✓ Press-and-hold interaction with progress bar (left-to-right fill) — v1.1
- ✓ Haptic feedback during press-and-hold progress — v1.1
- ✓ Progress bar completion opens photo triage view — v1.1
- ✓ Replace Archive/Journal buttons with iOS Mail-style swipe gestures — v1.1
- ✓ Swipe left reveals Archive action, swipe right reveals Journal action — v1.1
- ✓ Native iOS swipe-to-action animations and behavior — v1.1
- ✓ Success page after triage with animated celebration (confetti/animation) — v1.1
- ✓ "Return to Camera" button on success page — v1.1
- ✓ Update camera control icons to match bottom nav icon design system — v1.1
- ✓ Visual consistency across all camera UI elements — v1.1

### Active

(None - v1.2 complete, ready for next milestone)

### Out of Scope

- No changes to photo capture logic (compression, upload, storage) - Only UI/UX updates
- No changes to darkroom reveal timing system (batch scheduling, random intervals) - Backend logic stays the same
- No changes to Feed, Friends, or Profile tabs - Strictly Camera/Darkroom + Auth refactor
- No changes to Firestore schema or photo lifecycle states - Keep existing data structure
- Email/password authentication - Replaced with phone auth in v1.2
- Apple Sign-In - Removed in v1.2 for simpler phone-only flow

## Context

**Codebase State (v1.2):**
- React Native mobile app with Expo managed workflow (SDK ~54.0.30)
- 44 files modified in v1.2 milestone (+4,679 / -1,089 lines)
- New: phoneAuthService, PhoneInputScreen, VerificationScreen, ErrorBoundary, phoneUtils
- New: scripts/generate-icons.js, scripts/generate-splash.js
- Deleted: LoginScreen, SignUpScreen, ForgotPasswordScreen, authService.js (legacy auth)
- Updated: AuthContext (phone auth), AppNavigator (phone-only flow), app.json (icons/splash)

**Tech Stack:**
- Firebase BaaS for backend (Firestore, Storage, Functions)
- React Native Firebase for phone authentication (@react-native-firebase/auth, @react-native-firebase/firestore)
- React Navigation 7.x for screen navigation (bottom tabs + nested stacks)
- expo-camera for camera access, expo-image-manipulator for compression
- react-native-gesture-handler for swipe gestures
- expo-haptics for tactile feedback
- react-native-svg for icon components
- libphonenumber-js for phone validation and formatting
- sharp for programmatic asset generation

**User Feedback:**
- Unified camera/darkroom flow feels more intuitive
- Swipe gestures match iOS patterns users already know
- Haptic feedback provides satisfying tactile confirmation
- Celebration page adds positive reinforcement
- Phone auth is simpler than email/password signup

## Constraints

- **Platform**: Expo Go compatible during development - No features requiring standalone build
- **Backend**: Keep existing Firebase structure - No schema changes to Firestore collections (photos, darkrooms, users)
- **Photo Lifecycle**: Preserve existing states - developing/revealed/triaged status logic unchanged
- **Real-time Sync**: Maintain Firestore listeners - Badge counts and photo updates must remain real-time
- **Navigation**: React Navigation 7.x - Use existing navigation framework and patterns
- **Testing**: Physical iOS device - Swipe gestures and haptics must be tested on real hardware

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Remove Darkroom tab from nav | User wants unified camera experience, darkroom accessed via button | ✓ Good |
| iOS Mail-style swipe actions | Native gesture pattern users already know, feels polished | ✓ Good |
| Press-and-hold to reveal | Adds ceremony and engagement to photo reveal moment | ✓ Good |
| Animated celebration success page | Positive reinforcement after completing triage | ✓ Good |
| Darkroom button left of capture | Positions secondary action away from primary (capture) | ✓ Good |
| Disable darkroom button when not ready | Clear visual affordance, prevents confusion | ✓ Good |
| Keep existing photoService/darkroomService | No need to refactor backend logic, only UI layer changes | ✓ Good |
| Absolute positioning for CameraView overlays | CameraView doesn't support children well in some expo-camera versions | ✓ Good |
| TAB_BAR_HEIGHT = 65px | Accounts for bottom tab navigator height including safe area | ✓ Good |
| Milestone-based haptics (25/50/75/100%) | Prevents battery drain and haptic fatigue while providing tactile confirmation | ✓ Good |
| React Native Firebase for phone auth | JS SDK cannot support silent APNs verification; native SDK enables seamless phone auth | ✓ Good |
| libphonenumber-js for validation | Lightweight validation, can enhance UI later | ✓ Good |
| Manual country picker (15 countries) | Simpler implementation, covers common cases | ✓ Good |
| Auto-submit on 6 digits | Better UX - no need to press verify button | ✓ Good |
| reCAPTCHA fallback over APNs | Simpler than configuring APNs certificates; works without full push notification setup | ✓ Good |
| RN Firebase Firestore for phone auth users | JS SDK Firestore doesn't share auth state with RN Firebase Auth | ✓ Good |
| Full deletion of authService.js | All email auth removed; cleaner than keeping utility functions | ✓ Good |
| ErrorBoundary inside NavigationContainer | Catches UI errors while allowing auth state listeners to work normally | ✓ Good |
| AsYouType formatter for phone input | Better UX without blocking input, shows formatted preview as user types | ✓ Good |
| 3-second retry delay after verification errors | Prevents rapid retry spam while not frustrating legitimate users | ✓ Good |
| Minimalist L letterform for app icon | Matches Lapse brand aesthetic, professional appearance | ✓ Good |
| Sharp library for programmatic icon generation | Reproducible assets, scripts can be rerun for updates | ✓ Good |

---
*Last updated: 2026-01-19 after v1.2 milestone*
