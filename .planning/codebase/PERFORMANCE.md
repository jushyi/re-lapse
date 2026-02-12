# Performance Optimization Guide

**Last Updated:** 2026-02-10
**Phases:** 30 (Initial), 46 (Comprehensive Optimization)

## Summary

Phase 30 addressed photo loading performance issues, particularly in the monthly album grid which was the primary user-reported concern. Phase 46 performed a comprehensive performance optimization across the entire app: server-side query filtering, Firestore indexes, complete expo-image migration with cacheKey, FlatList optimization for all lists, React Compiler for automatic memoization, and Cloud Functions cold-start optimization.

## Phase 46 Optimizations

Phase 46 was a comprehensive performance pass across 6 plans (46-01 through 46-06), touching every layer of the stack: Firestore queries, indexes, image loading, list rendering, compile-time optimization, and Cloud Functions.

### 46-01: Feed Query Server-Side Filtering

**Problem:** Feed queries fetched all photos and filtered client-side — O(all_photos) reads.

**Solution:** Refactored all feed queries to use Firestore `in` operator with server-side filtering.

- `getFeedPhotos` and `getUserFeedPhotos` use server-side `in` filtering with cursor-based pagination (DocumentSnapshot cursors)
- `subscribeFeedPhotos` creates chunked `in` listeners with Map-based merge and proper multi-listener cleanup
- `getRandomFriendPhotos` queries only friend photos with `limit(50)` instead of scanning entire collection
- Added `chunkArray` helper and `FIRESTORE_IN_LIMIT` constant (30) for reuse across services
- Sort by `triagedAt` (aligns with composite index)

**Files modified:** `src/services/firebase/feedService.js`

### 46-02: Firestore Indexes & Read Optimization

**Problem:** Missing composite indexes caused full collection scans; unbounded queries read entire collections; count operations downloaded all documents.

**Solution:** Added indexes, bounded all queries, batch user reads, count aggregation.

- **5 new composite indexes** added to `firestore.indexes.json` (8 total)
- **12 field exemptions** to reduce index storage costs
- `.limit()` applied to every unbounded Firestore query across 7 service files
- `getCountFromServer` for all count-only operations (developing, revealed, journaled, archived counts)
- `batchFetchUserData` helper for deduplicated batch user fetching
- Batched `markNotificationsAsRead` (500 per batch)

**Limit guidelines established:**
| Context | Limit |
| --- | --- |
| Social queries (blocks, friends) | 500 |
| Content queries (photos, albums) | 100 |
| Existence checks | 1 |

**Files modified:** `firestore.indexes.json`, `photoService.js`, `feedService.js`, `albumService.js`, `blockService.js`, `notificationService.js`, `userService.js`, `friendshipService.js`

### 46-03: Image Loading & Caching (Complete expo-image Migration)

**Problem:** Remaining files still used React Native `Image`; no cacheKey meant Firebase URL token rotation caused re-downloads; no CDN caching headers on uploads.

**Solution:** Complete expo-image migration, stable cacheKey on all sources, CDN edge caching.

- Migrated remaining 7 files from React Native `Image` to `expo-image`
- Added stable `cacheKey` to all 20+ expo-image sources — prevents re-downloads on Firebase URL token rotation
- Added `Cache-Control: public, max-age=31536000` (1 year) metadata to all 3 upload functions in `storageService.js`
- Skipped cacheKey for iTunes album art (stable Apple CDN URLs) and local device URIs (not Firebase-hosted)

**cacheKey pattern:**

```javascript
<Image
  source={{ uri: photo.imageURL }}
  cacheKey={`photo-${photo.id}`} // Stable key survives URL token rotation
  contentFit="cover"
  cachePolicy="memory-disk"
/>
```

**Files modified:** 22 files (see complete list below)

### 46-04: FlatList & React Rendering

**Problem:** 12 FlatLists lacked optimization props; renderItem callbacks recreated on every render; list item components not memoized.

**Solution:** Optimization props on all FlatLists, useCallback wrapping, React.memo on list items.

- All 17 FlatLists in the app now have `initialNumToRender`, `maxToRenderPerBatch`, `windowSize`, `removeClippedSubviews`
- FeedScreen: `updateCellsBatchingPeriod={50}` for smooth Animated.FlatList scrolling
- PhoneInputScreen: `getItemLayout` for fixed 49px rows
- Wrapped `renderFeedItem` and `renderNotificationItem` in `useCallback`
- Fixed FeedScreen `ListHeaderComponent` and `ListFooterComponent` from `={fn()}` (call) to `={fn}` (reference)
- Added `React.memo` to FriendCard, CommentRow, AlbumCard, MonthlyAlbumCard

**Files modified:** 18 files across 12 FlatList files and 6 memoization files

### 46-05: React Compiler & Console Stripping

**Problem:** Manual memoization coverage was incomplete; production builds included console.log overhead.

**Solution:** React Compiler for automatic compile-time memoization; babel plugin for console stripping.

- **React Compiler** (`babel-plugin-react-compiler@1.0.0`) — automatic useMemo/useCallback/React.memo at compile time
- **Console stripping** (`babel-plugin-transform-remove-console@6.9.4`) — removes all console.\* calls in production builds
- Full compatibility with Reanimated 4.1.1 confirmed (no `sources` restriction needed)
- Babel plugin ordering: react-compiler before reanimated, reanimated always last

**Files modified:** `babel.config.js`, `package.json`, `package-lock.json`

### 46-06: Cloud Functions Performance

**Problem:** Cloud Functions had slow cold starts (~4-5s) due to gRPC binary loading; no resource configs; top-level imports loaded unused modules.

**Solution:** preferRest initialization, resource configs, lazy imports.

- **preferRest** — Firestore REST transport instead of gRPC, cold starts reduced from 4-5s to 1-2s
- **Resource configs** — All 12 Gen 1 functions have `.runWith()` with memory (256-512MB) and timeout (60-300s); all 5 Gen 2 `onCall` functions have options objects (256-512MiB, 30-300s)
- **Lazy imports** — Storage and notification modules lazy-loaded inside function bodies (non-notification functions don't load Expo SDK)
- No `minInstances` yet — deferred until production monitoring (costs ~$6/month per warm instance)

**Files modified:** `functions/index.js`

## Firestore Composite Indexes

All composite indexes defined in `firestore.indexes.json`:

| Collection | Fields                                                     | Purpose                            |
| ---------- | ---------------------------------------------------------- | ---------------------------------- |
| `comments` | `parentId` ASC, `createdAt` DESC                           | Reply threading queries            |
| `photos`   | `photoState` ASC, `scheduledForPermanentDeletionAt` ASC    | Deletion cleanup function          |
| `photos`   | `photoState` ASC, `userId` ASC, `deletionScheduledAt` DESC | User's deleted photos              |
| `photos`   | `photoState` ASC, `triagedAt` ASC                          | Feed range queries                 |
| `photos`   | `userId` ASC, `photoState` ASC, `triagedAt` ASC            | Feed `in` operator queries (46-01) |
| `photos`   | `userId` ASC, `status` ASC, `capturedAt` DESC              | User photo queries by status       |
| `photos`   | `userId` ASC, `capturedAt` DESC                            | User photo queries                 |
| `albums`   | `userId` ASC, `updatedAt` DESC                             | User album queries                 |

**Field exemptions (12):** Disabled indexing on large/unused fields (`reactions`, `imageURL`, `visibility`, `reactionCount`, `commentCount`, `revealedAt`, `taggedUserIds`, `taggedAt`, `body`, `title`, `data`, `senderProfilePhotoURL`)

## Files Still Using RN Image

**None** -- all remote image files have been migrated to expo-image as of Phase 46-03.

## Files Already Using expo-image (25 files)

**Phase 30 migrations (7 files):**

- `src/screens/MonthlyAlbumGridScreen.js`
- `src/components/AlbumPhotoViewer.js`
- `src/screens/AlbumGridScreen.js`
- `src/screens/AlbumPhotoPickerScreen.js`
- `src/screens/RecentlyDeletedScreen.js`
- `src/screens/SelectsScreen.js`
- `src/components/SelectsBanner.js`

**Pre-existing expo-image usage (10 files):**

- `src/screens/PhotoDetailScreen.js`
- `src/components/PhotoDetailModal.js`
- `src/components/SwipeablePhotoCard.js`
- `src/components/comments/CommentRow.js`
- `src/components/comments/CommentInput.js`
- `src/components/MeStoryCard.js`
- `src/components/FriendStoryCard.js`
- `src/components/ClipSelectionModal.js`
- `src/components/SongSearchResult.js`
- `src/hooks/useDarkroom.js`

**Phase 46-03 new migrations (8 files):**

- `src/screens/StoriesViewerModal.js` (fixed CRIT-6 bug)
- `src/components/AlbumCard.js`
- `src/components/MonthlyAlbumCard.js`
- `src/components/FullscreenSelectsViewer.js`
- `src/components/InAppNotificationBanner.js`
- `src/screens/ProfileScreen.js`
- `src/components/ProfileSong/ProfileSongCard.js`
- `src/components/FeedPhotoCard.js`

**Phase 46-03 cacheKey added (additional files):**

- `src/components/FriendCard.js`
- `src/navigation/AppNavigator.js`

## Key Optimizations Applied

### 1. expo-image Migration

**Problem:** React Native `Image` has unreliable caching, blocks UI thread during resize, and causes flicker during list recycling.

**Solution:** Migrated all remote image screens to `expo-image` with proper props.

**Standard pattern for photo grids:**

```javascript
import { Image } from 'expo-image';

<Image
  source={{ uri: photo.imageURL }}
  style={styles.photoImage}
  contentFit="cover"
  cachePolicy="memory-disk"
  cacheKey={`photo-${photo.id}`} // REQUIRED: survives Firebase URL token rotation
  priority="normal" // or "high" for fullscreen, "low" for thumbnails
  recyclingKey={photo.id} // REQUIRED in lists - prevents flicker
  transition={150} // optional fade-in
/>;
```

**Priority guidelines:**

| Context                            | Priority   |
| ---------------------------------- | ---------- |
| Fullscreen photos                  | `"high"`   |
| Visible on profile (SelectsBanner) | `"high"`   |
| Grid thumbnails                    | `"normal"` |
| Off-screen list thumbnails         | `"low"`    |

### 2. FlatList Optimization

**Problem:** Missing optimization props caused async layout calculations and stuttery scrolling.

**Solution:** Added optimization props to all 17 FlatLists.

**Standard pattern:**

```javascript
<FlatList
  data={photos}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  getItemLayout={(data, index) => ({
    length: CELL_HEIGHT,
    offset: CELL_HEIGHT * index,
    index,
  })}
  initialNumToRender={9} // Enough to fill screen
  maxToRenderPerBatch={6} // Smaller batches for smoother scroll
  windowSize={5} // 2 above + 1 visible + 2 below
  removeClippedSubviews={true}
/>
```

**Why each prop matters:**

| Prop                    | Purpose                                                      |
| ----------------------- | ------------------------------------------------------------ |
| `getItemLayout`         | Pre-computed positions, avoids async measurement             |
| `initialNumToRender`    | Reduces initial render, should fill first screen             |
| `maxToRenderPerBatch`   | Smaller batches = smoother scroll, larger = faster scroll-to |
| `windowSize`            | Memory vs performance tradeoff (5 is balanced)               |
| `removeClippedSubviews` | Detaches off-screen views from native hierarchy              |

### 3. Render Memoization

**Problem:** renderItem re-creates on every render, causing unnecessary re-renders.

**Solution:** Wrap renderItem callbacks in `useCallback` + React.memo on list item components.

```javascript
const renderItem = useCallback(({ item }) => <PhotoItem photo={item} />, []); // Empty deps if no external dependencies
```

**Memoized list item components:** FriendCard, CommentRow, AlbumCard, MonthlyAlbumCard, FeedPhotoCard (custom comparator), FriendStoryCard

### 4. React Compiler (Automatic Memoization)

**Problem:** Manual memoization coverage is inherently incomplete and error-prone.

**Solution:** React Compiler automatically applies useMemo/useCallback/React.memo at compile time.

```javascript
// babel.config.js
plugins: [
  ['babel-plugin-react-compiler'], // Must be before reanimated
  // ...
  'react-native-reanimated/plugin', // Must be last
];
```

- Enabled app-wide with no `sources` restriction
- Full Reanimated 4.1.1 compatibility confirmed
- Console stripping via `babel-plugin-transform-remove-console` in production only

### 5. Cloud Functions preferRest

**Problem:** gRPC binary loading causes 4-5 second cold starts.

**Solution:** REST transport via preferRest, resource configs, lazy imports.

```javascript
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();
db.settings({ preferRest: true });
```

- Cold starts reduced from ~4-5s to ~1-2s (50-70% improvement)
- Monitor for ECONNRESET stability after deployment

## CDN Edge Caching

All photo uploads include `Cache-Control` metadata for Firebase Storage CDN caching:

```javascript
const metadata = {
  contentType: 'image/jpeg',
  cacheControl: 'public, max-age=31536000', // 1 year - photos are immutable
};
```

Applied to all 3 upload functions in `storageService.js`:

- `uploadPhoto`
- `uploadProfilePhoto`
- `uploadSelectsPhoto`

## Guidelines for New Screens

When building new screens with photo grids:

1. **Always use `expo-image` for remote images**
   - Import: `import { Image } from 'expo-image';`
   - Never use React Native `Image` for URL-based photos
   - Always add `cacheKey={`type-${id}`}` for Firebase-hosted images

2. **Apply FlatList optimization props for any list > 10 items**
   - All 5 props: getItemLayout (when possible), initialNumToRender, maxToRenderPerBatch, windowSize, removeClippedSubviews

3. **Use appropriate priority levels**
   - `high` for main content (fullscreen, hero images)
   - `normal` for visible grid items
   - `low` for thumbnails in scrollable strips

4. **Always add `recyclingKey` for images in lists**
   - Prevents image flicker during FlatList recycling
   - Use unique identifier: `recyclingKey={item.id}`

5. **Memoize renderItem with useCallback**
   - Prevents unnecessary re-renders during scroll
   - React Compiler handles this automatically, but explicit is fine

6. **Firestore queries must have `.limit()`**
   - No unbounded reads — always specify a limit
   - Use `getCountFromServer` for count-only operations

7. **Cloud Functions: lazy-load non-essential modules**
   - Only require modules inside function body if not all functions need them

## Performance Verification Checklist

Use this checklist to verify photo performance in new screens:

- [ ] Open screen with 20+ photos
- [ ] Scroll rapidly up and down
- [ ] Check: No blank cells during scroll
- [ ] Check: Photos appear quickly on stop
- [ ] Check: No flicker when scrolling back to viewed photos
- [ ] Check: Memory usage stable (no continuous growth)

## Future Optimization Opportunities

1. **Image preloading** - expo-image supports `Image.prefetch()` for anticipated loads
2. **Progressive loading** - blurhash placeholders for better perceived performance
3. **Memory monitoring** - Add performance hooks to track image memory usage
4. **minInstances on Cloud Functions** - Warm instances for critical functions (after production monitoring)
5. **Firebase Performance Monitoring** - Automated trace collection (Phase 47)

## Commit History

### Phase 30

| Plan  | Commits              | Description                                                   |
| ----- | -------------------- | ------------------------------------------------------------- |
| 30-01 | `9dfb7b6`, `508ff8f` | MonthlyAlbumGridScreen migration                              |
| 30-02 | `dbe2229`, `c762a1b` | AlbumPhotoViewer migration                                    |
| 30-03 | `3dc4166`, `8736aad` | AlbumGridScreen, AlbumPhotoPickerScreen migration             |
| 30-04 | `cd62160`, `c7f8cb2` | RecentlyDeletedScreen, SelectsScreen, SelectsBanner migration |

### Phase 46

| Plan  | Commits              | Description                                                     |
| ----- | -------------------- | --------------------------------------------------------------- |
| 46-01 | `2c9f188`, `c0743ab` | Feed query server-side filtering with `in` operator             |
| 46-02 | `2d0b697`, `acc5f99` | Firestore indexes, query limits, batch reads, count aggregation |
| 46-03 | `9e095b6`, `a371556` | Complete expo-image migration, cacheKey, Cache-Control headers  |
| 46-04 | `afb9c58`, `8e466f4` | FlatList optimization props, useCallback, React.memo            |
| 46-05 | `b70ddc6`            | React Compiler and production console stripping                 |
| 46-06 | `0a9fff3`, `9021919` | Cloud Functions preferRest, resource configs, lazy imports      |

---

_Phase: 30-optimization-performance, 46-performance-optimization_
_Created: 2026-02-05_
_Updated: 2026-02-10_
