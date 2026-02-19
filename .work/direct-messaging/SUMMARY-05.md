---
feature: direct-messaging
plan: 05
title: "Input & Header Components"
status: success
completed: 2026-02-19
commits:
  - dfc4f95 feat(dm): create DMInput component with text and GIF support
  - 519d47a feat(dm): create ConversationHeader with profile info and report menu
---

## Summary

Created two self-contained UI components for the DM conversation screen: **DMInput** (message input bar) and **ConversationHeader** (navigation header).

## What was built

### DMInput (`src/components/DMInput.js`)
- Text input with multiline support (up to 4 visible lines), 2000 character limit
- GIF button that opens Giphy picker via existing `@giphy/react-native-sdk` integration
- Send button (arrow-up PixelIcon) appears only when text is present
- Calls `onSendMessage(text, null)` for text, `onSendMessage(null, gifUrl)` for GIFs
- Input clears automatically after sending; keyboard stays open (`blurOnSubmit={false}`)
- Disabled state shows "You can no longer message this person" for unfriended users
- Safe area bottom inset via `useSafeAreaInsets()` for edge-to-edge Android
- Platform-aware padding via `Platform.select` for iOS/Android differences

### ConversationHeader (`src/components/ConversationHeader.js`)
- Back button with `chevron-back` PixelIcon, calls `onBackPress`
- Circular 32px profile photo using `expo-image` with `cachePolicy="memory-disk"`
- Display name with `numberOfLines={1}` ellipsis truncation
- Both profile photo and name are tappable, calling `onProfilePress`
- Three-dot menu (`ellipsis-vertical` PixelIcon) opens `Alert.alert` with "Report User" option
- Safe area top padding via `useSafeAreaInsets()` for status bar
- Border bottom uses `colors.border.subtle` with `StyleSheet.hairlineWidth`

## Design decisions

- **DMInput is fully separate from CommentInput** -- no shared code, no imports from CommentInput. Only shares the `GifPicker` utility module (`openGifPicker`, `useGifSelection`) which is a standalone helper, not part of CommentInput itself.
- Used `arrow-up` PixelIcon for the send button (same pattern as CommentInput) since no `send` icon exists in pixelIcons.js.
- Used "GIF" text button instead of a PixelIcon since no GIF icon exists in pixelIcons.js (same approach as CommentInput).
- All colors use `colors` constants from `src/constants/colors.js` -- zero hardcoded hex values.

## Verification

- [x] `npm run lint` -- no errors in either component
- [x] `npm test` -- 735 passed, 3 pre-existing failures (photoLifecycle.test.js, unrelated)
- [x] Both files exist in `src/components/`
- [x] DMInput completely separate from CommentInput
- [x] GIF integration uses `@giphy/react-native-sdk`
- [x] Colors use constants only
- [x] Profile photos use `expo-image` with `cachePolicy="memory-disk"`

## Deviations

None. Implementation matches the plan exactly.
