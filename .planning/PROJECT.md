# Lapse Clone - Camera/Darkroom UX Refactor

## What This Is

A comprehensive UI/UX refactor of the Camera and Darkroom experience in the Lapse social media clone app. This consolidates the two separate tabs into a unified camera experience with native iOS gestures for photo triage, a press-and-hold reveal interaction, and visual consistency across all camera controls.

## Core Value

Seamless, native-feeling photo capture and reveal experience that combines the camera and darkroom into one intuitive flow with smooth iOS gestures and haptic feedback.

## Requirements

### Validated

<!-- Shipped and confirmed valuable from existing codebase -->

- ✓ Photo capture with front/back camera toggle — existing
- ✓ Flash control (off/on/auto) — existing
- ✓ Photo compression and Firebase upload — existing
- ✓ Darkroom batch reveal system with timer — existing
- ✓ Photo triage (Archive/Journal/Delete) — existing
- ✓ Real-time badge count for developing photos — existing
- ✓ Firebase photo lifecycle (developing → revealed → triaged) — existing
- ✓ Friend feed display with journaled photos — existing
- ✓ React Navigation bottom tab bar — existing
- ✓ Haptic feedback system — existing

### Active

<!-- Current scope being built toward -->

- [ ] Remove Darkroom tab from bottom navigation, keep Camera tab only
- [ ] Add darkroom button on left side of capture button in CameraScreen
- [ ] Darkroom button disabled/greyed out when no photos ready to reveal
- [ ] Darkroom button opens bottom sheet with "press and hold to reveal" UI
- [ ] Press-and-hold interaction with progress bar (left-to-right fill)
- [ ] Haptic feedback during press-and-hold progress
- [ ] Progress bar completion opens photo triage view
- [ ] Replace Archive/Journal buttons with iOS Mail-style swipe gestures
- [ ] Swipe left reveals Archive action, swipe right reveals Journal action
- [ ] Native iOS swipe-to-action animations and behavior
- [ ] Success page after triage with animated celebration (confetti/animation)
- [ ] "Return to Camera" button on success page
- [ ] Update camera control icons to match bottom nav icon design system
- [ ] Visual consistency across all camera UI elements

### Out of Scope

<!-- Explicit boundaries -->

- No changes to photo capture logic (compression, upload, storage) — Only UI/UX updates
- No changes to darkroom reveal timing system (batch scheduling, random intervals) — Backend logic stays the same
- No changes to Feed, Friends, or Profile tabs — Strictly Camera/Darkroom refactor
- No changes to Firestore schema or photo lifecycle states — Keep existing data structure
- No changes to Firebase Security Rules — Backend permissions unchanged
- No changes to push notification system — Existing notification flow preserved

## Context

**Existing Codebase:**
- React Native mobile app with Expo managed workflow (SDK ~54.0.30)
- Firebase BaaS for backend (Auth, Firestore, Storage, Functions)
- React Navigation 7.x for screen navigation (bottom tabs + nested stacks)
- expo-camera for camera access, expo-image-manipulator for compression
- Custom logger utility with environment-aware, structured logging
- Haptic feedback utility (expo-haptics) already integrated

**Current Camera/Darkroom Implementation:**
- CameraScreen (`lapse-clone-app/src/screens/CameraScreen.js`) - Photo capture interface
- DarkroomScreen (`lapse-clone-app/src/screens/DarkroomScreen.js`) - Batch reveal and triage
- photoService (`lapse-clone-app/src/services/firebase/photoService.js`) - Photo upload and lifecycle
- darkroomService (`lapse-clone-app/src/services/firebase/darkroomService.js`) - Reveal timing and badge count
- MainTabNavigator in AppNavigator.js - Separate Camera and Darkroom tabs

**User Pain Points Addressed:**
- Two separate tabs for related functionality (camera + darkroom) feels disjointed
- Button-based triage doesn't feel native on iOS
- Camera control icons don't match the clean design system of nav icons
- Current reveal flow lacks engagement and ceremony

**Design Philosophy:**
- Native iOS gestures and interactions (swipe actions like Mail app)
- Haptic feedback for tactile confirmation
- Progressive disclosure (darkroom accessed from camera, not separate tab)
- Celebratory moments (success page with animation)

## Constraints

- **Platform**: Expo Go compatible during development — No features requiring standalone build
- **Backend**: Keep existing Firebase structure — No schema changes to Firestore collections (photos, darkrooms, users)
- **Photo Lifecycle**: Preserve existing states — developing/revealed/triaged status logic unchanged
- **Real-time Sync**: Maintain Firestore listeners — Badge counts and photo updates must remain real-time
- **Navigation**: React Navigation 7.x — Use existing navigation framework and patterns
- **Testing**: Physical iOS device — Swipe gestures and haptics must be tested on real hardware

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Remove Darkroom tab from nav | User wants unified camera experience, darkroom accessed via button | — Pending |
| iOS Mail-style swipe actions | Native gesture pattern users already know, feels polished | — Pending |
| Press-and-hold to reveal | Adds ceremony and engagement to photo reveal moment | — Pending |
| Animated celebration success page | Positive reinforcement after completing triage | — Pending |
| Darkroom button left of capture | Positions secondary action away from primary (capture) | — Pending |
| Disable darkroom button when not ready | Clear visual affordance, prevents confusion | — Pending |
| Keep existing photoService/darkroomService | No need to refactor backend logic, only UI layer changes | — Pending |

---
*Last updated: 2026-01-12 after initialization*
