# Performance Optimization Guide

**Last Updated:** 2026-02-05
**Phase:** 30 - Optimization and Performance Enhancements

## Summary

Phase 30 addressed photo loading performance issues, particularly in the monthly album grid which was the primary user-reported concern. The optimization focused on two key areas:

1. **Image Loading:** Migrated from React Native `Image` to `expo-image` for persistent caching and better memory management
2. **List Virtualization:** Added FlatList optimization props for smoother scrolling in photo-heavy screens

## Key Optimizations Applied

### 1. expo-image Migration

**Problem:** React Native `Image` has unreliable caching, blocks UI thread during resize, and causes flicker during list recycling.

**Solution:** Migrated all photo-heavy screens to `expo-image` with proper props.

**Files migrated in Phase 30:**

| File                                    | Purpose                              | Plan  |
| --------------------------------------- | ------------------------------------ | ----- |
| `src/screens/MonthlyAlbumGridScreen.js` | Monthly album photo grid             | 30-01 |
| `src/components/AlbumPhotoViewer.js`    | Fullscreen photo viewer + thumbnails | 30-02 |
| `src/screens/AlbumGridScreen.js`        | Album photo grid                     | 30-03 |
| `src/screens/AlbumPhotoPickerScreen.js` | Photo picker for albums              | 30-03 |
| `src/screens/RecentlyDeletedScreen.js`  | Recently deleted photos grid         | 30-04 |
| `src/screens/SelectsScreen.js`          | Selects editing screen               | 30-04 |
| `src/components/SelectsBanner.js`       | Profile selects slideshow            | 30-04 |

**Standard pattern for photo grids:**

```javascript
import { Image } from 'expo-image';

<Image
  source={{ uri: photo.imageURL }}
  style={styles.photoImage}
  contentFit="cover"
  cachePolicy="memory-disk"
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

**Solution:** Added optimization props to all photo FlatLists.

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

**Solution:** Wrap renderItem callbacks in `useCallback`.

```javascript
const renderItem = useCallback(({ item }) => <PhotoItem photo={item} />, []); // Empty deps if no external dependencies
```

## Files Still Using RN Image

These files still use React Native `Image` and are candidates for future optimization:

| File                                            | Usage                  | Priority          |
| ----------------------------------------------- | ---------------------- | ----------------- |
| `src/components/AlbumCard.js`                   | Album cover thumbnails | Medium            |
| `src/components/FeedPhotoCard.js`               | Feed photo display     | Medium            |
| `src/components/FriendCard.js`                  | Friend profile photos  | Low               |
| `src/components/FullscreenSelectsViewer.js`     | Full-screen selects    | Medium            |
| `src/components/MonthlyAlbumCard.js`            | Monthly album covers   | Medium            |
| `src/navigation/AppNavigator.js`                | Tab bar profile icon   | Low (small 28x28) |
| `src/components/ProfileSong/ProfileSongCard.js` | iTunes album art       | Low               |
| `src/screens/ProfileScreen.js`                  | Profile photo          | Low               |

**Rationale for not migrating:**

- These screens weren't part of the primary performance issue (monthly albums)
- Tab bar icon and profile photo are single images, not lists
- Can be migrated in future optimization pass if needed

## Files Already Using expo-image (17 files)

- SelectsBanner, SelectsScreen, RecentlyDeletedScreen (Phase 30)
- AlbumPhotoPickerScreen, AlbumGridScreen, AlbumPhotoViewer, MonthlyAlbumGridScreen (Phase 30)
- PhotoDetailScreen, PhotoDetailModal, SwipeablePhotoCard
- CommentRow, CommentInput
- MeStoryCard, FriendStoryCard
- ClipSelectionModal, SongSearchResult
- useDarkroom hook

## Guidelines for New Screens

When building new screens with photo grids:

1. **Always use `expo-image` for remote images**
   - Import: `import { Image } from 'expo-image';`
   - Never use React Native `Image` for URL-based photos

2. **Apply FlatList optimization props for any list > 10 items**
   - All 5 props: getItemLayout, initialNumToRender, maxToRenderPerBatch, windowSize, removeClippedSubviews

3. **Use appropriate priority levels**
   - `high` for main content (fullscreen, hero images)
   - `normal` for visible grid items
   - `low` for thumbnails in scrollable strips

4. **Always add `recyclingKey` for images in lists**
   - Prevents image flicker during FlatList recycling
   - Use unique identifier: `recyclingKey={item.id}`

5. **Memoize renderItem with useCallback**
   - Prevents unnecessary re-renders during scroll

## Performance Verification Checklist

Use this checklist to verify photo performance in new screens:

- [ ] Open screen with 20+ photos
- [ ] Scroll rapidly up and down
- [ ] Check: No blank cells during scroll
- [ ] Check: Photos appear quickly on stop
- [ ] Check: No flicker when scrolling back to viewed photos
- [ ] Check: Memory usage stable (no continuous growth)

## Future Optimization Opportunities

1. **Remaining RN Image files** - 8 files could be migrated for consistency
2. **Image preloading** - expo-image supports `Image.prefetch()` for anticipated loads
3. **Progressive loading** - blurhash placeholders for better perceived performance
4. **Memory monitoring** - Add performance hooks to track image memory usage

## Phase 30 Commit History

| Plan  | Commits              | Description                                                   |
| ----- | -------------------- | ------------------------------------------------------------- |
| 30-01 | `9dfb7b6`, `508ff8f` | MonthlyAlbumGridScreen migration                              |
| 30-02 | `dbe2229`, `c762a1b` | AlbumPhotoViewer migration                                    |
| 30-03 | `3dc4166`, `8736aad` | AlbumGridScreen, AlbumPhotoPickerScreen migration             |
| 30-04 | `cd62160`, `c7f8cb2` | RecentlyDeletedScreen, SelectsScreen, SelectsBanner migration |

---

_Phase: 30-optimization-performance_
_Created: 2026-02-05_
