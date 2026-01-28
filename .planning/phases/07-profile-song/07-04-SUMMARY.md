# Plan 07-04 Summary: Clip Selection with WaveformScrubber

## Completed

- Created `src/services/audioDownloader.js` for caching audio files
- Created `src/components/ProfileSong/WaveformScrubber.js` with dual-handle range selection
- Created `src/components/ProfileSong/ClipSelectionModal.js` for clip selection flow
- Integrated ClipSelectionModal into ProfileScreen song selection flow
- Exported components from index files

## Key Implementation Details

### WaveformScrubber

- **Simulated waveform visualization** using bar components (no native modules)
- Pseudo-random bar heights seeded by songId for consistent visual patterns
- Dual draggable handles for start/end selection
- Uses react-native-gesture-handler Pan gestures with reanimated shared values
- Proper worklet directives in gesture callbacks
- State sync via `useAnimatedReaction` with `runOnJS`
- Minimum 5-second gap enforced between handles
- Time labels showing start, end, and selected duration

### ClipSelectionModal

- Full-screen modal with song info display
- WaveformScrubber for range selection
- Preview button to hear selected clip
- Confirm button to save selection
- Automatic playback cleanup on modal close

### ProfileScreen Integration

- Added `selectedSongForClip` state
- Modified `handleSongSelected` to open clip modal instead of direct save
- Added `handleClipConfirm` and `handleClipCancel` handlers

## Deviations from Plan

1. **Replaced native waveform library with simulated visual**
   - Original: `@simform_solutions/react-native-audio-waveform` native module
   - Changed to: Simulated bar visualization using React Native views
   - Reason: Native library had Metro bundling issues (`Unable to resolve "./WaveformCandleTypes"`)
   - Impact: Visual-only waveform (not actual audio amplitude), but cleaner and cross-platform

2. **Gesture handler worklet pattern**
   - Added `'worklet'` directive to all gesture callbacks
   - Used `useAnimatedReaction` + `runOnJS` for state synchronization
   - Pre-calculated pixel conversion values outside worklets
   - Reason: Initial implementation caused crash when dragging handles

## Commits

- `15f5c45` - feat(07-04): install waveform library and create audioDownloader
- `3380cf7` - feat(07-04): create WaveformScrubber component
- `62e289e` - feat(07-04): create ClipSelectionModal and integrate
- `7e860c3` - fix(07-04): replace native waveform with simulated visual
- `fc30d2d` - fix(07-04): fix gesture handler crash with worklet pattern

## Files Changed

- `src/services/audioDownloader.js` (created)
- `src/components/ProfileSong/WaveformScrubber.js` (created)
- `src/components/ProfileSong/ClipSelectionModal.js` (created)
- `src/components/ProfileSong/index.js` (updated)
- `src/components/index.js` (updated)
- `src/screens/ProfileScreen.js` (updated)

## Verification

- [x] WaveformScrubber displays simulated waveform with draggable handles
- [x] Range selection works (start/end clamped properly with 5s minimum gap)
- [x] ClipSelectionModal integrates waveform and preview
- [x] Full flow works: search → select → clip selection → save
- [x] Audio plays selected clip range on profile
