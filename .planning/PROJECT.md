# Lapse Clone - Camera/Darkroom UX Refactor

## What This Is

A comprehensive UI/UX refactor of the Camera and Darkroom experience in the Lapse social media clone app. This consolidates the two separate tabs into a unified camera experience with native iOS gestures for photo triage, a press-and-hold reveal interaction, and visual consistency across all camera controls.

## Core Value

Seamless, native-feeling photo capture and reveal experience that combines the camera and darkroom into one intuitive flow with smooth iOS gestures and haptic feedback.

## Current State (v1.1 Shipped)

**Shipped:** 2026-01-12
**Execution time:** 4.3 hours (5 phases, 8 plans)

The Camera/Darkroom UX Refactor milestone is complete. Users now experience:
- Single camera tab with darkroom button (badge shows developing/revealed count)
- Press-and-hold to reveal photos with progress bar and haptic milestones
- Swipe gestures for triage (left=Archive, right=Journal) like iOS Mail
- Celebration page with confetti after completing triage
- Polished SVG icons matching the app's design system

## Requirements

### Validated

- Remove Darkroom tab from bottom navigation, keep Camera tab only - v1.1
- Add darkroom button on left side of capture button in CameraScreen - v1.1
- Darkroom button disabled/greyed out when no photos ready to reveal - v1.1
- Darkroom button opens bottom sheet with "press and hold to reveal" UI - v1.1
- Press-and-hold interaction with progress bar (left-to-right fill) - v1.1
- Haptic feedback during press-and-hold progress - v1.1
- Progress bar completion opens photo triage view - v1.1
- Replace Archive/Journal buttons with iOS Mail-style swipe gestures - v1.1
- Swipe left reveals Archive action, swipe right reveals Journal action - v1.1
- Native iOS swipe-to-action animations and behavior - v1.1
- Success page after triage with animated celebration (confetti/animation) - v1.1
- "Return to Camera" button on success page - v1.1
- Update camera control icons to match bottom nav icon design system - v1.1
- Visual consistency across all camera UI elements - v1.1

### Active

(None - milestone complete)

### Out of Scope

- No changes to photo capture logic (compression, upload, storage) - Only UI/UX updates
- No changes to darkroom reveal timing system (batch scheduling, random intervals) - Backend logic stays the same
- No changes to Feed, Friends, or Profile tabs - Strictly Camera/Darkroom refactor
- No changes to Firestore schema or photo lifecycle states - Keep existing data structure
- No changes to Firebase Security Rules - Backend permissions unchanged
- No changes to push notification system - Existing notification flow preserved

## Context

**Codebase State (v1.1):**
- React Native mobile app with Expo managed workflow (SDK ~54.0.30)
- 29 files modified in this milestone
- 4,344 lines added, 245 removed
- New components: DarkroomBottomSheet, SwipeablePhotoCard, SuccessScreen
- Updated: CameraScreen (absolute positioning layout, SVG icons), DarkroomScreen (swipe triage), AppNavigator (4-tab nav)

**Tech Stack:**
- Firebase BaaS for backend (Auth, Firestore, Storage, Functions)
- React Navigation 7.x for screen navigation (bottom tabs + nested stacks)
- expo-camera for camera access, expo-image-manipulator for compression
- react-native-gesture-handler for swipe gestures
- expo-haptics for tactile feedback
- react-native-svg for icon components

**User Feedback:**
- Unified camera/darkroom flow feels more intuitive
- Swipe gestures match iOS patterns users already know
- Haptic feedback provides satisfying tactile confirmation
- Celebration page adds positive reinforcement

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
| Remove Darkroom tab from nav | User wants unified camera experience, darkroom accessed via button | Good |
| iOS Mail-style swipe actions | Native gesture pattern users already know, feels polished | Good |
| Press-and-hold to reveal | Adds ceremony and engagement to photo reveal moment | Good |
| Animated celebration success page | Positive reinforcement after completing triage | Good |
| Darkroom button left of capture | Positions secondary action away from primary (capture) | Good |
| Disable darkroom button when not ready | Clear visual affordance, prevents confusion | Good |
| Keep existing photoService/darkroomService | No need to refactor backend logic, only UI layer changes | Good |
| Absolute positioning for CameraView overlays | CameraView doesn't support children well in some expo-camera versions | Good |
| TAB_BAR_HEIGHT = 65px | Accounts for bottom tab navigator height including safe area | Good |
| Milestone-based haptics (25/50/75/100%) | Prevents battery drain and haptic fatigue while providing tactile confirmation | Good |

---
*Last updated: 2026-01-12 after v1.1 milestone*
