# Phase 7: Profile Song - Research

**Researched:** 2026-01-28
**Domain:** Music streaming integration with React Native (Spotify, Apple Music, audio playback, waveform visualization)
**Confidence:** MEDIUM

<research_summary>

## Summary

Researched the music streaming ecosystem for implementing a profile song feature with search, preview playback, and waveform-based clip selection. The landscape has significantly changed since late 2024.

**Critical finding:** Spotify deprecated preview_url in their Web API as of November 27, 2024. This eliminates the primary method for playing song previews without requiring users to authenticate with Spotify. Workarounds exist (embed scraping) but are unofficial.

The recommended approach is a **dual-source strategy**: Use iTunes Search API as the primary preview source (reliable, no auth required, 30-second previews available), with optional Spotify/Apple Music integration for authenticated users who want enhanced features.

For waveform visualization, native modules like `@simform_solutions/react-native-audio-waveform` or `react-native-audiowaveform` provide the required functionality. The project already has expo-av for audio playback, which is sufficient for preview playback with manual fade-out implementation.

**Primary recommendation:** Build around iTunes Search API for universal preview playback, add optional Spotify/Apple Music OAuth for users who want to link their accounts, use native waveform library for clip selection UI.
</research_summary>

<standard_stack>

## Standard Stack

### Core

| Library                                        | Version | Purpose                    | Why Standard                                     |
| ---------------------------------------------- | ------- | -------------------------- | ------------------------------------------------ |
| expo-av                                        | 16.0.8  | Audio playback             | Already installed, handles preview playback well |
| iTunes Search API                              | N/A     | Song search + preview URLs | Free, no auth, reliable 30s previews             |
| @simform_solutions/react-native-audio-waveform | 1.3.x   | Waveform visualization     | Native performance, static mode for files        |

### Supporting

| Library                    | Version | Purpose                     | When to Use                                            |
| -------------------------- | ------- | --------------------------- | ------------------------------------------------------ |
| expo-auth-session          | 6.x     | OAuth flows                 | If adding Spotify/Apple Music account linking          |
| expo-crypto                | latest  | PKCE support                | Required peer dependency for auth-session              |
| react-native-audiowaveform | 1.x     | Alternative waveform        | If need direct URL support without download            |
| expo-file-system           | latest  | Download audio for waveform | May be needed to cache preview for waveform generation |

### Alternatives Considered

| Instead of                  | Could Use                     | Tradeoff                                               |
| --------------------------- | ----------------------------- | ------------------------------------------------------ |
| iTunes API                  | Spotify embed scraping        | Unofficial, fragile, may break                         |
| expo-av                     | react-native-track-player     | Better for background audio, but overkill for previews |
| @simform_solutions waveform | @kaannn/react-native-waveform | Less documented but supports remote URLs directly      |

**Installation:**

```bash
npm install @simform_solutions/react-native-audio-waveform react-native-gesture-handler
# Already have expo-av, gesture-handler, and reanimated
```

**Note:** Waveform libraries require development builds (already using expo-dev-client).
</standard_stack>

<architecture_patterns>

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── ProfileSong/
│   │   ├── ProfileSongCard.js       # Display card with album art, title, play button
│   │   ├── SongSearchModal.js       # Search interface
│   │   ├── SongSearchResult.js      # Individual result card (same layout as profile card)
│   │   ├── WaveformScrubber.js      # Clip selection with waveform
│   │   └── index.js
│   └── ...
├── services/
│   ├── iTunesService.js             # iTunes Search API wrapper
│   ├── audioPlayer.js               # expo-av wrapper with fade out
│   └── ...
├── hooks/
│   ├── useAudioPlayer.js            # Audio playback state management
│   ├── useSongSearch.js             # Search state and debouncing
│   └── ...
└── utils/
    └── audioHelpers.js              # Fade out, duration formatting, etc.
```

### Pattern 1: iTunes Search API Integration

**What:** Simple REST API calls to iTunes for song search and preview URLs
**When to use:** All song search functionality
**Example:**

```typescript
// Source: iTunes Search API documentation
const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';

async function searchSongs(query: string, limit = 25): Promise<Song[]> {
  const params = new URLSearchParams({
    term: query,
    media: 'music',
    entity: 'song',
    limit: String(limit),
  });

  const response = await fetch(`${ITUNES_SEARCH_URL}?${params}`);
  const data = await response.json();

  return data.results.map((track: any) => ({
    id: String(track.trackId),
    title: track.trackName,
    artist: track.artistName,
    album: track.collectionName,
    albumArt: track.artworkUrl100?.replace('100x100', '300x300'),
    previewUrl: track.previewUrl,
    duration: track.trackTimeMillis,
  }));
}
```

### Pattern 2: Audio Playback with Fade Out

**What:** expo-av playback with manual fade out on navigation
**When to use:** Playing preview audio
**Example:**

```typescript
// Source: expo-av documentation + community patterns
import { Audio } from 'expo-av';

async function fadeOutAndStop(sound: Audio.Sound, durationMs = 1500) {
  const steps = 15;
  const stepDuration = durationMs / steps;

  for (let i = steps; i >= 0; i--) {
    await sound.setVolumeAsync(i / steps);
    await new Promise(resolve => setTimeout(resolve, stepDuration));
  }

  await sound.stopAsync();
  await sound.unloadAsync();
}
```

### Pattern 3: Clip Selection Storage

**What:** Store start/end timestamps with song reference
**When to use:** Saving user's selected clip portion
**Example:**

```typescript
// Song data structure with clip selection
interface ProfileSong {
  songId: string; // iTunes track ID
  title: string;
  artist: string;
  albumArt: string;
  previewUrl: string;
  clipStart: number; // Start time in seconds (0-30)
  clipEnd: number; // End time in seconds (0-30)
  // Firestore: stored in user document
}

// Playback: seek to clipStart, stop at clipEnd
async function playClip(sound: Audio.Sound, clipStart: number, clipEnd: number) {
  await sound.setPositionAsync(clipStart * 1000);
  await sound.playAsync();

  // Schedule stop at clipEnd
  const clipDuration = (clipEnd - clipStart) * 1000;
  setTimeout(() => fadeOutAndStop(sound), clipDuration - 1500);
}
```

### Anti-Patterns to Avoid

- **Using Spotify preview_url:** Deprecated Nov 2024, will return null for new apps
- **Requiring OAuth for basic preview:** iTunes API needs no auth, keep it simple
- **Playing full songs without auth:** Only 30s previews are legal without subscription
- **Generating waveforms on every play:** Cache waveform data, generate once
  </architecture_patterns>

<dont_hand_roll>

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem                    | Don't Build            | Use Instead                                    | Why                                        |
| -------------------------- | ---------------------- | ---------------------------------------------- | ------------------------------------------ |
| Waveform visualization     | Canvas/SVG drawing     | @simform_solutions/react-native-audio-waveform | Native performance, handles audio decoding |
| Audio amplitude extraction | FFT/audio processing   | Waveform library (built-in)                    | Complex DSP, platform-specific             |
| Fade out animation         | Manual setInterval     | expo-av setVolumeAsync in loop                 | Need precise timing, avoid audio glitches  |
| Song search API            | Spotify API            | iTunes Search API                              | No auth needed, preview_url works          |
| OAuth PKCE flow            | Manual implementation  | expo-auth-session                              | Handles code verifier, token exchange      |
| Duration formatting        | Manual string building | date-fns (already installed)                   | Handles edge cases                         |

**Key insight:** Music app development has many solved problems. The waveform libraries handle audio decoding, amplitude extraction, and rendering natively - doing this in JS would be slow and complex. iTunes API provides what Spotify no longer offers without needing to maintain unofficial workarounds.
</dont_hand_roll>

<common_pitfalls>

## Common Pitfalls

### Pitfall 1: Spotify Preview URL Deprecation

**What goes wrong:** App searches Spotify, gets null preview_url, no audio plays
**Why it happens:** Spotify deprecated preview_url Nov 27, 2024 for new apps
**How to avoid:** Use iTunes Search API as primary source
**Warning signs:** preview_url field consistently null in Spotify API responses

### Pitfall 2: Waveform Library Expo Go Incompatibility

**What goes wrong:** App crashes or waveform doesn't render in Expo Go
**Why it happens:** Native waveform libraries need development builds
**How to avoid:** Project already uses expo-dev-client - ensure testing on dev builds, not Expo Go
**Warning signs:** "Native module not found" errors

### Pitfall 3: Audio Not Playing in Background

**What goes wrong:** Audio stops when navigating away or screen locks
**Why it happens:** expo-av default doesn't enable background audio
**How to avoid:** For profile songs (short previews), this is likely desired behavior. If background needed, configure Audio.setAudioModeAsync with staysActiveInBackground
**Warning signs:** Audio cuts off immediately on navigation

### Pitfall 4: Memory Leaks from Sound Objects

**What goes wrong:** App gets slower, eventually crashes
**Why it happens:** Not calling sound.unloadAsync() after playback
**How to avoid:** Always unload in useEffect cleanup, after fade out
**Warning signs:** Memory usage grows with each song play

### Pitfall 5: Rate Limiting iTunes API

**What goes wrong:** Search stops working, 403 errors
**Why it happens:** iTunes API limited to ~20 calls/minute
**How to avoid:** Debounce search input (500ms+), cache results
**Warning signs:** Intermittent search failures, especially during rapid typing

### Pitfall 6: Waveform Generation from Remote URL

**What goes wrong:** Waveform library fails to load remote audio
**Why it happens:** Some libraries only support local file paths
**How to avoid:** Download preview to cache first using expo-file-system, then pass local path
**Warning signs:** Empty waveform, "file not found" errors
</common_pitfalls>

<code_examples>

## Code Examples

Verified patterns from official sources:

### iTunes Search API Call

```typescript
// Source: Apple iTunes Search API documentation
const searchSongs = async (term: string) => {
  const encoded = encodeURIComponent(term);
  const response = await fetch(
    `https://itunes.apple.com/search?term=${encoded}&media=music&entity=song&limit=25`
  );
  const json = await response.json();

  // Response includes: trackId, trackName, artistName, artworkUrl100, previewUrl
  return json.results;
};
```

### expo-av Sound Playback

```typescript
// Source: Expo documentation
import { Audio } from 'expo-av';

const useAudioPlayer = () => {
  const soundRef = useRef<Audio.Sound | null>(null);

  const playPreview = async (previewUrl: string) => {
    // Unload any existing sound
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: previewUrl },
      { shouldPlay: true, volume: 1.0 }
    );
    soundRef.current = sound;

    // Handle playback completion
    sound.setOnPlaybackStatusUpdate(status => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  return { playPreview };
};
```

### Waveform Component (Static Mode)

```typescript
// Source: @simform_solutions/react-native-audio-waveform docs
import { Waveform, type IWaveformRef } from '@simform_solutions/react-native-audio-waveform';

const WaveformScrubber = ({ audioPath, onSelectionChange }) => {
  const waveformRef = useRef<IWaveformRef>(null);

  return (
    <Waveform
      mode="static"
      ref={waveformRef}
      path={audioPath}  // Local file path required
      candleSpace={2}
      candleWidth={4}
      candleHeightScale={4}
      containerStyle={{ height: 80 }}
      waveColor="#555"
      scrubColor="#fff"
      onPlayerStateChange={(state) => console.log('Player state:', state)}
      onCurrentProgressChange={(currentProgress, totalDuration) => {
        // Track playback position for scrubbing
      }}
    />
  );
};
```

### Download Audio for Waveform

```typescript
// Source: expo-file-system documentation
import * as FileSystem from 'expo-file-system';

const downloadForWaveform = async (previewUrl: string, songId: string) => {
  const localPath = `${FileSystem.cacheDirectory}preview_${songId}.m4a`;

  // Check if already cached
  const fileInfo = await FileSystem.getInfoAsync(localPath);
  if (fileInfo.exists) {
    return localPath;
  }

  // Download
  const download = await FileSystem.downloadAsync(previewUrl, localPath);
  return download.uri;
};
```

</code_examples>

<sota_updates>

## State of the Art (2025-2026)

| Old Approach                 | Current Approach             | When Changed      | Impact                                                  |
| ---------------------------- | ---------------------------- | ----------------- | ------------------------------------------------------- |
| Spotify preview_url          | Deprecated - use iTunes API  | Nov 2024          | Major - breaks existing Spotify preview implementations |
| Spotify implicit grant OAuth | PKCE required                | Nov 2025 deadline | Must use Authorization Code + PKCE                      |
| expo-av only                 | expo-audio (newer) available | 2025              | expo-audio is newer but expo-av still supported         |
| HTTP OAuth redirects         | HTTPS + Universal Links only | Spotify Nov 2025  | Deep linking changes for Spotify auth                   |

**New tools/patterns to consider:**

- **Spotify Embed Scraping:** Unofficial workaround at github.com/rexdotsh/spotify-preview-url-workaround - extracts preview URL from embed player HTML. Not recommended as primary solution.
- **expo-music-kit:** Apple MusicKit for Expo (iOS + Web) - option if wanting native Apple Music integration
- **react-native-audio-api:** Software Mansion library for advanced audio features, <10ms latency

**Deprecated/outdated:**

- **Spotify preview_url in Web API:** Removed for new apps Nov 2024
- **Spotify implicit grant:** Deadline Nov 2025
- **HTTP redirect URIs for Spotify:** Must be HTTPS
  </sota_updates>

<open_questions>

## Open Questions

Things that couldn't be fully resolved:

1. **Waveform drag selection UX**
   - What we know: Libraries support scrubbing/seeking
   - What's unclear: How to implement start+end range selection (dual handles)
   - Recommendation: May need custom component wrapping waveform, or use two markers on single waveform

2. **Apple Music preview URL availability**
   - What we know: MusicKit provides catalog access, iTunes API works
   - What's unclear: Whether Apple Music API provides preview URLs equivalent to iTunes
   - Recommendation: iTunes API is simpler and sufficient for preview-only use case

3. **Spotify embed scraping longevity**
   - What we know: Works today by scraping embed player HTML
   - What's unclear: How long this workaround will remain functional
   - Recommendation: Don't depend on it - use iTunes API as primary

4. **Waveform library performance with remote audio**
   - What we know: Some require local paths, some claim to support URLs
   - What's unclear: Real-world performance and reliability
   - Recommendation: Plan to download to cache first, test both approaches
     </open_questions>

<sources>
## Sources

### Primary (HIGH confidence)

- [Expo expo-av Documentation](https://docs.expo.dev/versions/latest/sdk/audio-av/) - Audio playback API
- [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/) - Song search and preview URLs
- [Spotify Web API Blog Post Nov 2024](https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api) - Preview URL deprecation announcement
- [Spotify OAuth Migration Nov 2025](https://developer.spotify.com/blog/2025-10-14-reminder-oauth-migration-27-nov-2025) - PKCE requirement deadline
- [@simform_solutions/react-native-audio-waveform GitHub](https://github.com/SimformSolutionsPvtLtd/react-native-audio-waveform) - Waveform library docs

### Secondary (MEDIUM confidence)

- [npm-compare expo-av vs react-native-track-player](https://npm-compare.com/expo-av,react-native-sound,react-native-track-player) - Library comparison
- [Spotify Community Forums](https://community.spotify.com/t5/Spotify-for-Developers/) - Developer discussions on preview_url deprecation
- [Apple MusicKit Documentation](https://developer.apple.com/musickit/) - Official Apple Music integration

### Tertiary (LOW confidence - needs validation)

- [Spotify Preview URL Workaround](https://github.com/rexdotsh/spotify-preview-url-workaround) - Unofficial embed scraping approach
- Community patterns for fade out implementation - common but not officially documented
  </sources>

<metadata>
## Metadata

**Research scope:**

- Core technology: expo-av audio, iTunes Search API
- Ecosystem: Waveform libraries, OAuth patterns, music APIs
- Patterns: Audio playback, clip selection, search integration
- Pitfalls: API deprecations, native module requirements, memory management

**Confidence breakdown:**

- Standard stack: MEDIUM - iTunes API verified, waveform library needs testing
- Architecture: HIGH - patterns from official documentation
- Pitfalls: HIGH - Spotify deprecation well documented
- Code examples: HIGH - from official sources

**Research date:** 2026-01-28
**Valid until:** 2026-02-28 (30 days - music API landscape changing)
</metadata>

---

_Phase: 07-profile-song_
_Research completed: 2026-01-28_
_Ready for planning: yes_
