---
phase: 07-profile-song
plan: 01
subsystem: audio
tags: [itunes-api, expo-av, audio-playback, profile-song]

# Dependency graph
requires:
  - phase: 05-profile-screen-layout
    provides: Profile screen foundation where song will display
provides:
  - iTunes Search API service for song lookup
  - Audio player service with fade out and clip range support
affects: [07-02, 07-03] # Song search UI, song player UI

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'Module-level sound state for single instance playback'
    - 'iTunes API response normalization to Song type'
    - 'Progressive fade out using setVolumeAsync loop'

key-files:
  created:
    - src/services/iTunesService.js
    - src/services/audioPlayer.js
  modified: []

key-decisions:
  - 'No debounce in service layer - UI handles debounce'
  - 'No caching - simple API calls sufficient for MVP'
  - 'No background audio mode - songs should stop on navigation (desired)'
  - '300x300 album art for higher quality display'

patterns-established:
  - 'Song type: { id, title, artist, album, albumArt, previewUrl, duration }'
  - 'Clip playback: clipStart/clipEnd in seconds, fade 1.5s before end'
  - 'Progress callback: 0-1 range within clip bounds'

issues-created: []

# Metrics
duration: 8min
completed: 2026-01-28
---

# Phase 7 Plan 1: Audio Infrastructure Summary

**iTunes Search API service and audio player with fade out and clip range support for profile song feature.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-28T18:30:00Z
- **Completed:** 2026-01-28T18:38:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- iTunes Search API service with searchSongs() and formatDuration()
- Audio player service with playPreview(), stopPreview(), pausePreview(), resumePreview(), seekTo()
- Smooth 15-step fade out over 1.5 seconds
- Clip range support with progress callbacks

## Task Commits

Each task was committed atomically:

1. **Task 1: Create iTunes Search API service** - `be0fca3` (feat)
2. **Task 2: Create audio player service** - `99e6a8e` (feat)

## Files Created/Modified

- `src/services/iTunesService.js` - Song search via iTunes API, returns normalized Song objects with 300x300 album art
- `src/services/audioPlayer.js` - Preview playback with clip range, fade out, progress tracking

## Decisions Made

- No debounce in service layer (UI layer handles debounce for better UX control)
- No caching (simple API calls sufficient for MVP, avoids stale data)
- No background audio mode (songs should stop when navigating away from profile)
- 300x300 album art by replacing 100x100 in iTunes response

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- Audio infrastructure complete, ready for UI components
- iTunesService can be used in song search screen
- audioPlayer can be used in song player/preview components

---

_Phase: 07-profile-song_
_Completed: 2026-01-28_
