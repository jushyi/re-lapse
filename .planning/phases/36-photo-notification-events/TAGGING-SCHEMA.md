# Photo Tagging Schema

This document defines the expected schema for photo tagging, to be implemented in Phase 39 (Darkroom) and Phase 40 (Feed). The `sendTaggedPhotoNotification` Cloud Function (created in Phase 36-02) is already listening for these changes.

## Photo Document Updates

When a user tags friends in a photo, the photo document should be updated with:

```javascript
{
  taggedUserIds: ['userId1', 'userId2'], // Array of tagged user IDs
  taggedAt: serverTimestamp(), // When tags were last modified
}
```

### Field Definitions

| Field           | Type        | Description                                      |
| --------------- | ----------- | ------------------------------------------------ |
| `taggedUserIds` | `string[]`  | Array of user IDs who are tagged in this photo   |
| `taggedAt`      | `Timestamp` | Server timestamp of when tags were last modified |

### Example Update

```javascript
import { updateDoc, doc, serverTimestamp, arrayUnion } from 'firebase/firestore';

// Add a new tag
await updateDoc(doc(db, 'photos', photoId), {
  taggedUserIds: arrayUnion(friendUserId),
  taggedAt: serverTimestamp(),
});

// Set multiple tags at once
await updateDoc(doc(db, 'photos', photoId), {
  taggedUserIds: [friend1Id, friend2Id, friend3Id],
  taggedAt: serverTimestamp(),
});
```

## Cloud Function Trigger

The `sendTaggedPhotoNotification` Cloud Function watches for:

- **Trigger**: `photos/{photoId}.onUpdate`
- **Logic**: Compares before/after `taggedUserIds` arrays
- **Notification**: Sends notifications only for NEWLY added tags (in after but not in before)

### Notification Behavior

- **Debouncing**: Multiple tags in 30-second window grouped into single notification
- **Templates**: 5+ varied wordings for single tags, 3+ for batch tags
- **Deep link**: Opens tagger's story, scrolls to tagged photo
- **Self-tag skip**: User won't be notified when tagging themselves
- **Deleted photos skip**: No notifications for photos with `photoState === 'deleted'`

## Integration Points

### Phase 39 (Darkroom Tagging)

When implementing tagging UI in the Darkroom:

1. Add tag button to `SwipeablePhotoCard` or `DarkroomScreen`
2. Show friend picker modal for selecting users to tag
3. Before calling `triagePhoto()`, update photo with `taggedUserIds`
4. Alternative: Add `taggedUserIds` as parameter to `triagePhoto()` function

**Recommended approach for darkroom:**

```javascript
// In darkroom triage flow
const handleTagFriends = async (photoId, selectedFriendIds) => {
  await updateDoc(doc(db, 'photos', photoId), {
    taggedUserIds: selectedFriendIds,
    taggedAt: serverTimestamp(),
  });
};
```

### Phase 40 (Feed Tagging)

When implementing tagging on existing feed photos:

1. Add "Tag Friends" option to photo three-dots menu
2. Show friend picker modal for selecting users to tag
3. Update photo document with new `taggedUserIds` array

**Recommended approach for feed:**

```javascript
// In feed photo menu
const handleTagFriends = async (photoId, existingTags, newTags) => {
  const mergedTags = [...new Set([...existingTags, ...newTags])];
  await updateDoc(doc(db, 'photos', photoId), {
    taggedUserIds: mergedTags,
    taggedAt: serverTimestamp(),
  });
};
```

## Notification Data Structure

When the Cloud Function sends a notification, it stores this structure in the `notifications` collection:

```javascript
{
  recipientId: taggedUserId,
  type: 'tagged',
  senderId: taggerId,
  senderName: 'Alex',
  senderProfilePhotoURL: 'https://...' || null,
  photoId: 'firstPhotoId', // First photo for deep link
  photoIds: ['photoId1', 'photoId2'], // All photos in batch
  photoCount: 2,
  message: 'Alex tagged you in 2 photos',
  createdAt: serverTimestamp(),
  read: false,
}
```

## Deep Link Handling

When user taps a tagged notification, `handleNotificationTapped()` returns:

```javascript
{
  success: true,
  data: {
    type: 'tagged',
    screen: 'Feed',
    params: {
      highlightUserId: taggerId, // Person who tagged (their story)
      highlightPhotoId: photoId, // Specific photo to show
      openStory: true, // Open the tagger's story
      scrollToPhoto: true, // Scroll to the specific tagged photo
    },
  },
}
```

The Feed/Story viewer should handle these params to:

1. Open the tagger's story
2. Scroll to or highlight the specific photo where user is tagged
3. Allow user to swipe through to see other photos

---

_Schema documented: 2026-02-06_
_Phase: 36-photo-notification-events (36-02)_
_For integration: Phase 39 (Darkroom Tagging), Phase 40 (Feed Tagging)_
