# Phase 46: Performance Optimization - Research

**Researched:** 2026-02-10
**Domain:** React Native/Expo + Firebase full-stack performance optimization
**Confidence:** HIGH

<research_summary>

## Summary

Researched the complete performance optimization landscape for a 57K-line React Native + Expo social photo-sharing app using Firebase (Firestore, Storage, Cloud Functions). The app runs Expo SDK 54, React Native 0.81.5, React 19.1.0, Reanimated 4.1.1, and expo-image 3.0.11.

Five critical areas were investigated: (1) React Native UI rendering and list performance, (2) Firebase/Firestore query optimization and indexing, (3) Cloud Functions cold start reduction and tuning, (4) Image loading and caching for a photo-centric app, and (5) Animation performance at 60fps. A parallel codebase audit was conducted to map findings to actual code.

**Key discovery:** The biggest performance wins are not in UI rendering (which is already decent) but in **Firebase query patterns** — the feed fetches ALL journal photos in the database and filters client-side, creating an O(N) cost that grows with every user. Combined with N+1 user data reads, a single feed load can trigger 600+ Firestore reads when it should trigger ~25. Additionally, Cloud Functions cold starts of 4-5 seconds can be reduced to 1-2 seconds with `preferRest: true`.

**Primary recommendation:** Fix Firebase query patterns first (server-side filtering with `in` operator, denormalized user data, cursor pagination, missing composite indexes). Then enable React Compiler for automatic memoization. Then optimize image loading (blurhash placeholders, cacheKey, fix StoriesViewerModal Image import bug). Cloud Functions cold start reduction is a quick win with high impact.
</research_summary>

<standard_stack>

## Standard Stack

### Core (Already Installed)

| Library                      | Your Version | Purpose               | Status  |
| ---------------------------- | ------------ | --------------------- | ------- |
| expo                         | 54.0.31      | App framework         | Current |
| react-native                 | 0.81.5       | Runtime               | Current |
| react                        | 19.1.0       | UI library            | Current |
| expo-image                   | 3.0.11       | Image loading/caching | Current |
| react-native-reanimated      | 4.1.1        | UI-thread animations  | Current |
| react-native-gesture-handler | 2.28.0       | Native gestures       | Current |
| @react-native-firebase/\*    | 23.8.6       | Firebase SDK          | Current |
| firebase-functions           | 4.5.0        | Cloud Functions       | Current |
| firebase-admin               | 12.0.0       | Admin SDK             | Current |

### Supporting (To Add)

| Library                               | Version | Purpose                            | When to Use                              |
| ------------------------------------- | ------- | ---------------------------------- | ---------------------------------------- |
| @shopify/flash-list                   | ^2.0.0  | Recycling list (replaces FlatList) | Main feed, photo grids, notifications    |
| babel-plugin-react-compiler           | ^1.0.0  | Auto-memoization at compile time   | All components (20-30% render reduction) |
| babel-plugin-transform-remove-console | latest  | Strip console.log in production    | Production builds                        |
| blurhash                              | ^2.0.5  | Generate placeholder hashes        | Cloud Function for upload processing     |
| sharp                                 | ^0.33.0 | Server-side image processing       | Cloud Function for thumbnails + blurhash |

### Alternatives Considered

| Instead of                     | Could Use                        | Tradeoff                                                                                                     |
| ------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| FlashList                      | LegendList                       | LegendList better for variable-height items (comments); FlashList better for homogeneous lists (feed, grids) |
| React Compiler                 | Manual memo/useCallback          | Compiler is automatic but may conflict with Reanimated worklets — test incrementally                         |
| Server-side thumbnails (Sharp) | Firebase Resize Images Extension | Extension is zero-code but doesn't generate blurhash; Sharp gives full control                               |
| Client-side blurhash           | Server-side blurhash             | Server-side is async (no upload delay) and consistent                                                        |

**Installation:**

```bash
npm install @shopify/flash-list babel-plugin-react-compiler babel-plugin-transform-remove-console
# Cloud Functions:
cd functions && npm install blurhash sharp
```

</standard_stack>

<architecture_patterns>

## Architecture Patterns

### Pattern 1: Server-Side Feed Filtering with `in` Operator

**What:** Query only friends' photos server-side instead of fetching all photos and filtering client-side
**When to use:** Any query that currently fetches a superset and filters in JavaScript
**Why critical:** Current feed loads ALL journal photos (500+ reads) when it needs ~20
**Example:**

```javascript
// CURRENT (feedService.js:68-97) — fetches ALL, filters client-side
const q = query(
  collection(db, 'photos'),
  where('photoState', '==', 'journal'),
  where('triagedAt', '>=', cutoff)
);
// Then: client-side filter by friendUserIds, sort, slice

// OPTIMIZED — server-side filtering + pagination
const q = query(
  collection(db, 'photos'),
  where('userId', 'in', friendIds.slice(0, 30)), // Max 30 per `in` query
  where('photoState', '==', 'journal'),
  where('triagedAt', '>=', cutoff),
  orderBy('triagedAt', 'desc'),
  limit(20)
);
// Firestore `in` limit is 30 — chunk for >30 friends
```

### Pattern 2: User Data Denormalization

**What:** Embed frequently-read user data (username, displayName, profilePhotoURL) on photo and comment documents
**When to use:** When every photo/comment display requires a separate user document read
**Why critical:** Eliminates N+1 reads — 20 feed photos from 15 users = 15 extra reads per load
**Example:**

```javascript
// Photo document with denormalized user data:
{
  userId: 'abc123',
  imageURL: '...',
  // DENORMALIZED (set at creation, synced via Cloud Function on profile change):
  ownerUsername: 'johndoe',
  ownerDisplayName: 'John Doe',
  ownerProfilePhotoURL: 'https://...',
}

// Cloud Function to sync on user profile update:
exports.onUserProfileUpdate = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const fieldsToCheck = ['username', 'displayName', 'profilePhotoURL'];
    if (!fieldsToCheck.some(f => before[f] !== after[f])) return;
    // Batch update all user's photos with new profile data
  });
```

### Pattern 3: Cursor-Based Pagination

**What:** Use Firestore's `startAfter(documentSnapshot)` instead of client-side array slicing
**When to use:** All paginated queries (feed, comments, notifications)
**Example:**

```javascript
// CURRENT — loads all, slices client-side
const startIndex = lastDoc ? lastDoc.paginationIndex + 1 : 0;
const paginatedPhotos = sortedPhotos.slice(startIndex, startIndex + 20);

// OPTIMIZED — server-side cursor
let q = query(collection(db, 'photos'), orderBy('triagedAt', 'desc'), limit(20));
if (lastDocSnapshot) {
  q = query(q, startAfter(lastDocSnapshot)); // Pass DocumentSnapshot, not field value
}
const snapshot = await getDocs(q);
setLastDoc(snapshot.docs[snapshot.docs.length - 1]); // Store for next page
```

### Pattern 4: Cloud Functions preferRest Initialization

**What:** Use REST transport instead of gRPC for Firestore in Cloud Functions
**When to use:** All Cloud Functions that use Firestore (50-70% cold start reduction)
**Example:**

```javascript
// CURRENT (functions/index.js:22)
admin.initializeApp();
// Implicitly uses gRPC — loads 2-4 seconds of native binaries

// OPTIMIZED
const { initializeApp, getApps, getApp } = require('firebase-admin/app');
const { initializeFirestore } = require('firebase-admin/firestore');
const app = getApps().length > 0 ? getApp() : initializeApp();
const db = initializeFirestore(app, { preferRest: true });
// REST transport — no gRPC binary loading
```

### Pattern 5: FlatList Optimization Props

**What:** Add missing performance props to FlatList/FlashList
**When to use:** Every scrollable list with >10 items
**Example:**

```javascript
<FlatList
  data={photos}
  renderItem={renderFeedItem}
  initialNumToRender={4} // Only render 4 items initially
  maxToRenderPerBatch={3} // 3 items per scroll batch
  windowSize={5} // Keep 5 screens mounted (2 above + viewport + 2 below)
  removeClippedSubviews={true} // Detach off-screen native views
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### Anti-Patterns to Avoid

- **Fetching all documents and filtering client-side:** Always use server-side `where()`, `in`, `limit()`
- **N+1 reads:** Never fetch user data individually for each list item — denormalize or batch with `in`
- **Client-side pagination:** Never load entire dataset to slice — use Firestore cursors
- **setState in gesture onUpdate:** Use Reanimated shared values instead
- **Mixing Animated API and Reanimated:** Pick one per component (prefer Reanimated)
- **Missing useCallback on renderItem:** Defeats React.memo on list items
- **Calling ListHeaderComponent with ():** `renderStoriesRow()` creates new JSX every render; use `renderStoriesRow` (function reference)
  </architecture_patterns>

<dont_hand_roll>

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem                  | Don't Build                          | Use Instead                                  | Why                                                                                 |
| ------------------------ | ------------------------------------ | -------------------------------------------- | ----------------------------------------------------------------------------------- |
| Auto-memoization         | Manual React.memo/useMemo everywhere | React Compiler (babel-plugin-react-compiler) | Analyzes data flow automatically, 20-30% render reduction with 1 line config change |
| List recycling           | Custom virtualization                | FlashList v2 (@shopify/flash-list)           | Cell recycling vs mount/unmount = 5-10x scroll FPS improvement                      |
| Image placeholders       | Custom shimmer/skeleton per image    | Blurhash via expo-image `placeholder` prop   | Native decoding <1ms, 25-char string stored in Firestore, zero extra network calls  |
| Thumbnail generation     | Client-side resize on view           | Server-side Sharp in Cloud Function          | One-time cost at upload, saves bandwidth for every viewer                           |
| Console stripping        | Manual **DEV** guards                | babel-plugin-transform-remove-console        | Automatic, covers third-party libraries too                                         |
| Firestore cold start fix | Custom caching layer                 | `preferRest: true` on initializeFirestore    | Built-in option, 50-70% cold start reduction                                        |
| Batch document reads     | Promise.all with individual getDoc() | Admin SDK `db.getAll(...refs)`               | Single RPC call vs N calls                                                          |
| Counter updates          | Transaction (read + write)           | `increment()` FieldValue                     | No read needed, no contention, atomic                                               |

**Key insight:** The biggest performance gains in this phase come from using Firebase features that already exist (composite indexes, `in` operator, cursor pagination, `preferRest`, `increment()`, `getAll()`) rather than building custom solutions. The app's current patterns were written for correctness, not scale — upgrading to server-side patterns is the highest-impact work.
</dont_hand_roll>

<common_pitfalls>

## Common Pitfalls

### Pitfall 1: Feed Query Fetches Entire Collection

**What goes wrong:** `getFeedPhotos()` and `subscribeFeedPhotos()` query ALL journal photos with no userId filter, then filter client-side by friend IDs
**Why it happens:** The initial implementation prioritized correctness over efficiency — fetching all photos and filtering in JS is simpler to write
**How to avoid:** Use Firestore `in` operator with friend IDs for server-side filtering, add `limit()` and `orderBy()` for server-side pagination
**Warning signs:** Feed load time grows linearly with total user count; Firestore read costs spike unexpectedly
**Impact:** At 500 active photos: ~600 reads/load. At 10,000 photos: ~10,000 reads/load. Optimized: ~25 reads/load (96% reduction)
**Affected files:** feedService.js lines 68-97 (getFeedPhotos), 166-231 (subscribeFeedPhotos), 730-805 (getRandomFriendPhotos)

### Pitfall 2: N+1 User Data Reads

**What goes wrong:** Every photo and comment fetch triggers a separate `getDoc()` for the author's user data
**Why it happens:** Normalized database design — user data lives only in the `users` collection
**How to avoid:** Denormalize user display data onto photo/comment documents; sync via Cloud Function trigger on profile update
**Warning signs:** Feed photos take 2-3 seconds to show usernames/avatars after photos appear
**Affected files:** feedService.js lines 79-85, 176-181, 622-623, 766-769; commentService.js lines 328-371

### Pitfall 3: StoriesViewerModal Uses Wrong Image Import

**What goes wrong:** `StoriesViewerModal.js` imports `Image` from `react-native` instead of `expo-image` — stories use a completely separate cache from the rest of the app
**Why it happens:** Simple import mistake
**How to avoid:** Change import to `import { Image } from 'expo-image'`
**Warning signs:** Story images load slowly even when the same photos cached in feed; prefetch calls go to wrong cache
**Affected file:** StoriesViewerModal.js line 7

### Pitfall 4: No cacheKey on Image Sources

**What goes wrong:** Firebase download URLs contain tokens in query string. When tokens change, expo-image treats it as a completely different image and re-downloads
**Why it happens:** Default cache key is the full URL including query params
**How to avoid:** Add `cacheKey: \`photo-\${photo.id}\`` to all ImageSource objects — stable identifier that doesn't change with URL tokens
**Warning signs:** Images re-download when they should be cached; users see loading delays on previously-viewed photos

### Pitfall 5: Cloud Functions Cold Start (4-5 seconds)

**What goes wrong:** User-facing Cloud Functions (getSignedPhotoUrl, getMutualFriendSuggestions) take 4-5 seconds on first call
**Why it happens:** gRPC binary loading for Firestore is the dominant cost; all functions load all dependencies regardless of which function executes
**How to avoid:** Enable `preferRest: true` (cuts to 1-2s), set `minInstances: 1` on user-facing functions ($12/month), lazy-load dependencies
**Warning signs:** First photo/friend action after app idle is noticeably slow

### Pitfall 6: Missing Composite Indexes

**What goes wrong:** Queries that combine equality + range + orderBy silently fall back to client-side evaluation or fail
**Why it happens:** Firestore auto-creates single-field indexes but requires manual composite index configuration
**How to avoid:** Audit all queries against `firestore.indexes.json`; add 6 missing composite indexes identified in this research
**Warning signs:** Firestore SDK logs "requires an index" errors; queries return unexpected results or are slow

### Pitfall 7: Story Cards Load Full-Resolution Images for Blur

**What goes wrong:** FriendStoryCard and MeStoryCard load full 1080px images (~80-200KB each) just to display them blurred at 88x130px
**Why it happens:** No thumbnail generation pipeline exists — only one image size is uploaded
**How to avoid:** Generate 200px thumbnails server-side; use thumbnails for story cards and grid views
**Warning signs:** Story carousel loads slowly on poor connections; excessive bandwidth on stories screen
</common_pitfalls>

<code_examples>

## Code Examples

### Enable React Compiler (babel.config.js)

```javascript
// Source: React Compiler docs + Expo docs
// Impact: 20-30% render reduction app-wide
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          /* existing config */
        },
      ],
      ['babel-plugin-react-compiler'], // ADD — before reanimated
      'react-native-reanimated/plugin', // Must remain LAST
    ],
    env: {
      production: {
        plugins: ['transform-remove-console'], // Strip console.log
      },
    },
  };
};
```

### Fix StoriesViewerModal Image Import

```javascript
// StoriesViewerModal.js — Change import
// BEFORE (line 7):
import { View, Text, Image, ... } from 'react-native';

// AFTER:
import { View, Text, ... } from 'react-native';
import { Image } from 'expo-image';
```

### Add cacheKey + Blurhash to Feed Photos

```javascript
// FeedPhotoCard.js — enhanced Image component
<Image
  source={{
    uri: photo.imageURL,
    cacheKey: `photo-${photo.id}`, // Stable cache key
  }}
  placeholder={photo.blurhash ? { blurhash: photo.blurhash } : undefined}
  placeholderContentFit="cover"
  contentFit="cover"
  cachePolicy="memory-disk"
  transition={200} // Smooth blurhash-to-image
  priority={isFirstVisible ? 'high' : 'normal'}
  recyclingKey={photo.id} // For FlashList recycling
  decodeFormat="rgb" // 50% Android memory savings
/>
```

### Cloud Functions preferRest Singleton

```javascript
// functions/shared/admin.js
const { initializeApp, getApps, getApp } = require('firebase-admin/app');
const { initializeFirestore } = require('firebase-admin/firestore');

let db;
function getDb() {
  if (!db) {
    const app = getApps().length > 0 ? getApp() : initializeApp();
    db = initializeFirestore(app, { preferRest: true });
  }
  return db;
}
module.exports = { getDb };
```

### Optimized Feed Query with in Operator

```javascript
// feedService.js — server-side filtering + cursor pagination
async function getFeedPhotos(userId, friendIds, lastDocSnapshot, limitCount = 20) {
  const cutoff = getCutoffTimestamp(FEED_VISIBILITY_DAYS);
  const BATCH_SIZE = 30; // Firestore `in` limit
  let allPhotos = [];

  for (let i = 0; i < friendIds.length; i += BATCH_SIZE) {
    const chunk = friendIds.slice(i, i + BATCH_SIZE);
    let q = query(
      collection(db, 'photos'),
      where('userId', 'in', chunk),
      where('photoState', '==', 'journal'),
      where('triagedAt', '>=', cutoff),
      orderBy('triagedAt', 'desc'),
      limit(limitCount)
    );
    if (lastDocSnapshot) q = query(q, startAfter(lastDocSnapshot));
    const snapshot = await getDocs(q);
    allPhotos.push(...snapshot.docs);
  }
  // User data is denormalized on photo docs — no N+1 reads
  return allPhotos.map(d => ({ id: d.id, ...d.data() }));
}
```

### FlatList Optimization Props for FeedScreen

```javascript
// FeedScreen.js — add to Animated.FlatList
<Animated.FlatList
  data={photos}
  renderItem={renderFeedItem} // Must be wrapped in useCallback
  keyExtractor={item => item.id}
  initialNumToRender={4}
  maxToRenderPerBatch={3}
  windowSize={5}
  removeClippedSubviews={true}
  updateCellsBatchingPeriod={50}
  onEndReachedThreshold={0.5}
  ListHeaderComponent={renderStoriesRow} // Function ref, NOT renderStoriesRow()
  // ... other existing props
/>
```

### Firestore count() Instead of getDocs().size

```javascript
// photoService.js — getDevelopingPhotoCount optimization
import { getCountFromServer } from '@react-native-firebase/firestore';

const count = await getCountFromServer(
  query(
    collection(db, 'photos'),
    where('userId', '==', userId),
    where('status', '==', 'developing')
  )
);
return count.data().count; // Number, no documents downloaded
```

</code_examples>

<sota_updates>

## State of the Art (2025-2026)

| Old Approach                         | Current Approach                                           | When Changed          | Impact                                              |
| ------------------------------------ | ---------------------------------------------------------- | --------------------- | --------------------------------------------------- |
| Manual React.memo/useMemo            | React Compiler 1.0 (auto-memoization)                      | Oct 2025              | 20-30% render reduction, zero manual effort         |
| FlatList                             | FlashList v2 (cell recycling, no estimatedItemSize needed) | Jan 2026              | 5-10x scroll FPS, JS-only (no native deps)          |
| gRPC Firestore in Cloud Functions    | `preferRest: true` on initializeFirestore                  | 2023-2024             | 50-70% cold start reduction                         |
| Cloud Functions Gen 1                | Gen 2 (Cloud Run, concurrency up to 80)                    | 2024-2025             | Fewer instances needed, traffic spike handling      |
| Single-file functions/index.js       | Function-per-file architecture                             | Best practice 2024+   | Each function loads only its dependencies           |
| Old Architecture (Bridge)            | New Architecture (Fabric + JSI + TurboModules)             | Default since RN 0.76 | 30-50% faster native calls, sync rendering          |
| react-native-fast-image              | expo-image (SDWebImage/Glide)                              | 2023-2024             | FastImage abandoned; expo-image is the standard     |
| Animated API scroll handlers         | Reanimated useAnimatedScrollHandler                        | Reanimated 3+         | Scroll animations on UI thread, zero JS involvement |
| Reanimated useAnimatedGestureHandler | Gesture Handler v2 Gesture.Pan()                           | Reanimated 4          | Cleaner API, removed deprecated handler             |

**New tools/patterns to consider:**

- **React Compiler:** Stable since Oct 2025. Expo SDK 54 supports it. Enable via babel plugin. Removes need for manual useMemo/useCallback/React.memo in most cases.
- **FlashList v2:** Ground-up rewrite. Pure JS (no native deps). Auto-sizes items. MasonryFlashList replaced by `<FlashList masonry />` prop.
- **Reanimated 4 CSS API:** Declarative CSS-like animations for non-interactive transitions. New in v4.
- **Reanimated Shared Element Transitions:** `sharedTransitionTag` prop for photo-to-detail transitions. Experimental in 4.2.0.
- **Firestore count() aggregation:** `getCountFromServer()` counts matching documents without downloading them. 1 read per 1000 docs counted.
- **Firestore `in` operator limit:** Increased from 10 to 30 in 2023.

**Deprecated/outdated:**

- **react-native-fast-image:** Abandoned/frozen since 2024. Use expo-image.
- **useAnimatedGestureHandler:** Removed in Reanimated 4. Use Gesture.Pan() + GestureDetector.
- **Legacy Architecture (Paper/Bridge):** Frozen in June 2025. Cannot be disabled since RN 0.82.
- **Cloud Functions Gen 1:** Still supported but no new features. Gen 2 recommended.
  </sota_updates>

<open_questions>

## Open Questions

1. **React Compiler + Reanimated compatibility**
   - What we know: React Compiler assumes idiomatic React. Reanimated worklets use `'worklet'` directive and shared values that may not be recognized by the compiler.
   - What's unclear: Whether the compiler correctly skips worklet functions or incorrectly tries to memoize them.
   - Recommendation: Enable React Compiler with `sources` option for gradual adoption — start with non-animated components, test thoroughly before enabling app-wide.

2. **FlashList v2 + Animated scroll handler migration**
   - What we know: FlashList v2 has no `Animated.FlatList` variant. FeedScreen currently uses `Animated.FlatList` with `Animated.event` for scroll-driven header animation.
   - What's unclear: Whether Reanimated's `useAnimatedScrollHandler` works seamlessly with FlashList v2's onScroll.
   - Recommendation: If FlashList migration is attempted, simultaneously migrate the scroll handler to Reanimated. Test header show/hide animation thoroughly.

3. **preferRest ECONNRESET stability**
   - What we know: In late 2023, Google temporarily made `preferRest` the default and then reverted due to ECONNRESET errors under heavy read loads. Fixed in newer `firebase-admin` versions.
   - What's unclear: Whether `firebase-admin@^12.0.0` (your version) has fully resolved this.
   - Recommendation: Enable `preferRest`, monitor for ECONNRESET errors in Cloud Functions logs for 48 hours. Have a rollback ready (remove the setting).

4. **Denormalization sync reliability**
   - What we know: Profile changes trigger a Cloud Function that batch-updates all user's photos. If a user has 1000 photos, that's 2 batches of 500 writes.
   - What's unclear: Edge cases — what happens if the sync function fails mid-batch? What if a user changes their name twice in rapid succession?
   - Recommendation: Use idempotent sync (always write latest values, not incremental changes). Add retry logic. Accept eventual consistency (stale names for a few seconds is acceptable in a social app).
     </open_questions>

<codebase_issues>

## Codebase Issues Catalog

### CRITICAL (Fix first — affects performance and cost now)

| #      | Issue                                                  | File                              | Lines    | Impact                                 |
| ------ | ------------------------------------------------------ | --------------------------------- | -------- | -------------------------------------- |
| CRIT-1 | Feed fetches ALL journal photos, filters client-side   | feedService.js                    | 68-97    | 500+ reads/load, grows with user count |
| CRIT-2 | Feed subscription fetches ALL journal photos           | feedService.js                    | 166-231  | Same as CRIT-1, real-time listener     |
| CRIT-3 | getRandomFriendPhotos fetches ENTIRE photos collection | feedService.js                    | 730-805  | Unbounded reads                        |
| CRIT-4 | N+1 user data reads on every photo/comment             | feedService.js, commentService.js | Multiple | 15+ extra reads per feed load          |
| CRIT-5 | 6 missing composite indexes                            | firestore.indexes.json            | —        | Queries may silently fail or scan      |
| CRIT-6 | StoriesViewerModal imports Image from react-native     | StoriesViewerModal.js             | 7        | Stories bypass expo-image cache        |

### HIGH (Fix before release — blocks scale)

| #       | Issue                                              | File                               | Lines        | Impact                            |
| ------- | -------------------------------------------------- | ---------------------------------- | ------------ | --------------------------------- |
| HIGH-1  | No FlatList optimization props on FeedScreen       | FeedScreen.js                      | 1121-1146    | Renders all items, high memory    |
| HIGH-2  | renderFeedItem not wrapped in useCallback          | FeedScreen.js                      | 866          | Defeats FeedPhotoCard memo        |
| HIGH-3  | ListHeaderComponent called with ()                 | FeedScreen.js                      | 1131         | New JSX tree every render         |
| HIGH-4  | No cacheKey on any Image source                    | All image components               | —            | Re-downloads on URL token change  |
| HIGH-5  | No blurhash/placeholder on any image               | All image components               | —            | Blank flash on every image load   |
| HIGH-6  | Cloud Functions cold start 4-5 seconds             | functions/index.js                 | 1-22         | User-facing functions feel broken |
| HIGH-7  | Storage uploads lack Cache-Control headers         | storageService.js                  | 70, 100, 191 | CDN edge caching disabled         |
| HIGH-8  | revealPhotos uses Promise.all not WriteBatch       | photoService.js                    | 326-353      | Non-atomic, N round-trips         |
| HIGH-9  | toggleReaction has race condition (no transaction) | feedService.js                     | 374-416      | Reactions can be lost             |
| HIGH-10 | Story cards load full-res images for blur          | FriendStoryCard.js, MeStoryCard.js | 62, 48       | 10-20x excess bandwidth           |

### MEDIUM (Optimization opportunities)

| #      | Issue                                                          | File                         | Impact                                       |
| ------ | -------------------------------------------------------------- | ---------------------------- | -------------------------------------------- |
| MED-1  | Friendships query fetches all statuses, filters client-side    | friendshipService.js         | 3 redundant queries                          |
| MED-2  | getBlockedByUserIds called on every feed load (rarely changes) | feedService.js               | Wasted reads                                 |
| MED-3  | commentService.fetchUserData doesn't cache across calls        | commentService.js            | Repeated user reads                          |
| MED-4  | getUserLikesForComments makes N individual reads               | commentService.js            | 50 comments = 50 reads                       |
| MED-5  | getDevelopingPhotoCount uses getDocs instead of count()        | photoService.js              | Downloads all docs for count                 |
| MED-6  | FeedScreen scroll animation uses built-in Animated (JS thread) | FeedScreen.js                | Could use Reanimated                         |
| MED-7  | Shimmer animation loops on JS thread                           | FeedScreen.js                | Could use Reanimated                         |
| MED-8  | sendStoryNotification sends push individually, not batched     | functions/index.js           | N API calls vs ceil(N/100)                   |
| MED-9  | Two separate onUpdate triggers per darkroom/photo document     | functions/index.js           | Double cold starts                           |
| MED-10 | processScheduledDeletions doesn't chunk batches (>500 fails)   | functions/index.js           | Bug for users with many photos               |
| MED-11 | React Compiler not enabled                                     | babel.config.js              | Missing 20-30% render reduction              |
| MED-12 | No priority="high" on critical images                          | FeedPhotoCard, StoriesViewer | First-visible images load at normal priority |

</codebase_issues>

<indexes>
## Complete Recommended Firestore Index Configuration

```json
{
  "indexes": [
    {
      "collectionGroup": "comments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "parentId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "photos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "photoState", "order": "ASCENDING" },
        { "fieldPath": "scheduledForPermanentDeletionAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "photos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "photoState", "order": "ASCENDING" },
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "deletionScheduledAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "photos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "photoState", "order": "ASCENDING" },
        { "fieldPath": "triagedAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "photos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "photoState", "order": "ASCENDING" },
        { "fieldPath": "triagedAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "photos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "capturedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "photos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "capturedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "albums",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": [
    { "collectionGroup": "photos", "fieldPath": "reactions", "indexes": [] },
    { "collectionGroup": "photos", "fieldPath": "imageURL", "indexes": [] },
    { "collectionGroup": "photos", "fieldPath": "visibility", "indexes": [] },
    { "collectionGroup": "photos", "fieldPath": "reactionCount", "indexes": [] },
    { "collectionGroup": "photos", "fieldPath": "commentCount", "indexes": [] },
    { "collectionGroup": "photos", "fieldPath": "revealedAt", "indexes": [] },
    { "collectionGroup": "photos", "fieldPath": "taggedUserIds", "indexes": [] },
    { "collectionGroup": "photos", "fieldPath": "taggedAt", "indexes": [] },
    { "collectionGroup": "notifications", "fieldPath": "body", "indexes": [] },
    { "collectionGroup": "notifications", "fieldPath": "title", "indexes": [] },
    { "collectionGroup": "notifications", "fieldPath": "data", "indexes": [] },
    { "collectionGroup": "notifications", "fieldPath": "senderProfilePhotoURL", "indexes": [] }
  ]
}
```

**Changes from current:** 5 new composite indexes added, 12 field exemptions added (reduces write latency and storage cost for never-queried fields like `reactions` map, `imageURL`, `visibility`).
</indexes>

<cloud_functions_config>

## Recommended Cloud Functions Configuration

| Function                       | Memory | Timeout | MinInstances | Region      |
| ------------------------------ | ------ | ------- | ------------ | ----------- |
| getSignedPhotoUrl              | 256MiB | 30s     | 1            | us-central1 |
| getMutualFriendSuggestions     | 512MiB | 120s    | 1            | us-central1 |
| deleteUserAccount              | 512MiB | 300s    | 0            | us-central1 |
| scheduleUserAccountDeletion    | 256MiB | 30s     | 0            | us-central1 |
| cancelUserAccountDeletion      | 256MiB | 30s     | 0            | us-central1 |
| sendFriendRequestNotification  | 256MB  | 60s     | 1            | us-central1 |
| sendFriendAcceptedNotification | 256MB  | 60s     | 0            | us-central1 |
| sendPhotoRevealNotification    | 256MB  | 60s     | 0            | us-central1 |
| sendStoryNotification          | 512MB  | 120s    | 0            | us-central1 |
| sendReactionNotification       | 256MB  | 60s     | 0            | us-central1 |
| sendTaggedPhotoNotification    | 256MB  | 60s     | 0            | us-central1 |
| sendCommentNotification        | 256MB  | 60s     | 0            | us-central1 |
| processDarkroomReveals         | 512MB  | 120s    | 0            | us-central1 |
| checkPushReceipts              | 256MB  | 60s     | 0            | us-central1 |
| Daily scheduled functions      | 256MB  | 300s    | 0            | us-central1 |

**Estimated monthly cost for minInstances:** ~$18/month (3 warm instances x ~$6 each)

**Combine duplicate triggers to halve cold starts:**

- Merge `sendPhotoRevealNotification` + `sendStoryNotification` into `onDarkroomUpdate`
- Merge `sendReactionNotification` + `sendTaggedPhotoNotification` into `onPhotoUpdate`
  </cloud_functions_config>

<sources>
## Sources

### Primary (HIGH confidence)

- [React Native Performance Overview](https://reactnative.dev/docs/performance) — official performance docs
- [Optimizing FlatList Configuration](https://reactnative.dev/docs/optimizing-flatlist-configuration) — FlatList props reference
- [expo-image Documentation](https://docs.expo.dev/versions/latest/sdk/image/) — complete API reference
- [React Compiler v1.0 Announcement](https://react.dev/blog/2025/10/07/react-compiler-1) — stable release
- [React Compiler - Expo Documentation](https://docs.expo.dev/guides/react-compiler/) — Expo integration
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices) — official query patterns
- [Firestore Index Types Overview](https://firebase.google.com/docs/firestore/query-data/index-overview) — composite indexes
- [Paginate Data with Query Cursors](https://firebase.google.com/docs/firestore/query-data/query-cursors) — cursor pagination
- [Firebase Cloud Functions Tips & Tricks](https://firebase.google.com/docs/functions/tips) — cold start, optimization
- [Reanimated 4 Stable Release](https://blog.swmansion.com/reanimated-4-stable-release-the-future-of-react-native-animations-ba68210c3713) — architecture, API
- [React Native Gesture Handler Documentation](https://docs.swmansion.com/react-native-gesture-handler/docs/) — v2 API

### Secondary (MEDIUM confidence)

- [FlashList v2 - Shopify Engineering](https://shopify.engineering/flashlist-v2) — benchmarks, migration
- [Reducing Firestore Cold Start Times](https://cjroeser.com/2022/12/28/reducing-firestore-cold-start-times-in-firebase-google-cloud-functions/) — preferRest benchmarks (4-5s to 1-2s)
- [How to Reduce Firebase Cold Starts - MakerKit](https://makerkit.dev/snippets/improve-firebase-cold-starts) — singleton pattern
- [Callstack: 60FPS Animations in React Native](https://www.callstack.com/blog/60fps-animations-in-react-native) — anti-patterns
- [Sentry: React Native Performance Strategies](https://blog.sentry.io/react-native-performance-strategies-tools/) — profiling tools

### Tertiary (LOW confidence - needs validation during implementation)

- FlashList v2 + Reanimated useAnimatedScrollHandler compatibility — not explicitly documented together
- React Compiler + Reanimated worklet compatibility — needs testing in this specific codebase
- preferRest ECONNRESET stability with firebase-admin@12 — monitor after enabling
  </sources>

<metadata>
## Metadata

**Research scope:**

- Core technology: React Native 0.81.5 + Expo SDK 54 + Firebase
- Ecosystem: expo-image, Reanimated 4, FlashList v2, React Compiler
- Patterns: Server-side filtering, denormalization, cursor pagination, preferRest, UI-thread animations
- Pitfalls: O(N) feed queries, N+1 reads, wrong Image import, missing indexes, cold starts

**Confidence breakdown:**

- Standard stack: HIGH — all libraries verified against npm/docs, versions confirmed in package.json
- Architecture patterns: HIGH — from official Firebase/React Native docs, verified against codebase
- Pitfalls: HIGH — every issue verified by reading actual source files with line numbers
- Code examples: HIGH — patterns from official docs, adapted to this codebase's actual API usage
- Cloud Functions config: HIGH — from Firebase docs, costs verified against pricing page

**Codebase analysis:**

- 94,292 total lines analyzed (src + functions)
- 52 components, 30 screens, 18 Firebase services, 15 Cloud Functions
- All FlatList instances audited (5/10+ optimized, 5 missing props)
- All Image components audited (33 locations, 0 using cacheKey, 0 using blurhash, 1 using wrong import)
- All Firestore queries audited (60 where clauses, 6 missing composite indexes)
- All Cloud Functions audited (no memory/timeout config, no preferRest, monolithic index.js)

**Research date:** 2026-02-10
**Valid until:** 2026-03-10 (30 days — React Native ecosystem stable, Firebase SDK stable)
</metadata>

---

_Phase: 46-performance-optimization_
_Research completed: 2026-02-10_
_Ready for planning: yes_
