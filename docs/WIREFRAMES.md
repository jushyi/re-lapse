# Lapse Clone - Core Screen Wireframes

**Version:** 1.0
**Last Updated:** 2026-01-06
**Status:** MVP Design

---

## Overview

This document provides wireframes for the 5 core screens needed for Week 2-4 implementation. These are text-based representations to guide UI development.

**Design Philosophy:**
- Minimal, clean interface (inspired by disposable cameras)
- Large touch targets for mobile
- Focus on photography, not UI chrome
- Black & white with accent colors for key actions

---

## 1. Login Screen

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│              [App Logo]                 │
│               LAPSE                     │
│                                         │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Email                             │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Password                    [👁]  │  │
│  └───────────────────────────────────┘  │
│                                         │
│         Forgot Password?                │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │          Login Button             │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │      Sign in with Apple 🍎        │  │
│  └───────────────────────────────────┘  │
│                                         │
│    Don't have an account? Sign Up       │
│                                         │
└─────────────────────────────────────────┘
```

**Key Elements:**
- Email input field (keyboard type: email)
- Password input field with show/hide toggle
- Primary "Login" button (black background, white text)
- Apple Sign-In button (white background, black text)
- "Forgot Password?" link (gray, small text)
- "Sign Up" link at bottom (gray text with black underline)

**Interactions:**
- Tap email/password fields → keyboard appears
- Tap Login → validate inputs → show loading spinner → navigate to Feed
- Tap Apple Sign-In → Apple auth flow → navigate to Feed
- Tap "Sign Up" → navigate to Sign Up screen
- Tap "Forgot Password" → navigate to Password Reset screen

---

## 2. Camera Screen

```
┌─────────────────────────────────────────┐
│ [Flash]                        [Close X]│
│                                         │
│                                         │
│                                         │
│                                         │
│            CAMERA PREVIEW               │
│              (Full Screen)              │
│                                         │
│                                         │
│                                         │
│                                         │
│  12 / 36 shots left today              │
│                                         │
│  [Flip]    ⃝ (Capture)    [Gallery]    │
│                                         │
└─────────────────────────────────────────┘
```

**Key Elements:**
- Full-screen camera preview (black bars on top/bottom)
- Flash toggle (top-left): OFF/ON/AUTO
- Close button (top-right): X icon
- Shot counter (center-bottom): "12 / 36 shots left today"
- Flip camera button (bottom-left): rotation icon
- Capture button (center-bottom): large circle
- Gallery button (bottom-right): grid icon

**Interactions:**
- Tap Flash → cycle through OFF/ON/AUTO
- Tap Flip → switch front/back camera
- Tap Capture → take photo → brief flash animation → show preview screen
- Tap Gallery → navigate to Profile screen (your photos)
- Tap Close → return to Feed screen

**States:**
- Normal: All buttons active, shot counter visible
- 36/36 shots: Capture button disabled (gray), show "Daily limit reached"
- No camera permission: Show permission prompt overlay

---

## 3. Feed Screen

```
┌─────────────────────────────────────────┐
│           🔔 (3)            Lapse       │
├─────────────────────────────────────────┤
│                                         │
│  [Friends] ───────────────────────────  │
│                                         │
│  ⭕  ⭕  ⭕  ⭕  ⭕  ⭕  ⭕  ⭕  →       │
│  🔴  🔴                                 │
│  Jane Mike Sara Alex John Kim  Tim Ben  │
│  NEW  NEW                               │
│                                         │
│  [Highlights] ─────────────────────────  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │         [Photo Preview]           │  │
│  │          (Square 1:1)             │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│  @username • 2h ago                     │
│  😂 24  ❤️ 18  🔥 15                    │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │         [Photo Preview]           │  │
│  │          (Square 1:1)             │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│  @friend2 • 5h ago                      │
│  ❤️ 12  ✨ 8  💯 6                      │
│                                         │
├─────────────────────────────────────────┤
│   👥      📷      👤                    │
│  Feed   Camera  Profile                 │
└─────────────────────────────────────────┘
```

**Key Elements:**
- Header: "Lapse" title (center), notification bell with badge (right)
- **Friends Section** (horizontal scroll):
  - Circular profile thumbnails in a row
  - Red dot indicator for friends with NEW unseen photos
  - "NEW" label below friends with unseen content
  - Scroll horizontally to see all friends
  - Friends with new content appear first, then alphabetically
- **Highlights Section** (vertical scroll):
  - Photo cards for highly-engaged content only
  - Square photo (1:1 aspect ratio)
  - Username and time posted
  - Reaction counts with emojis (only shows photos with 10+ reactions/comments)
- Bottom tab navigation (3 tabs):
  - Feed (👥) - active
  - Camera (📷) - center, larger
  - Profile (👤)

**Interactions:**
- Tap notification bell → navigate to Notifications screen
- **Tap friend thumbnail → open Friend Photo Viewer (full-screen modal)**
  - If friend has NEW photos → opens to first unseen photo
  - If no new photos → opens to most recent photo
  - Can swipe left/right to navigate through their last 7 days of photos
  - Shows comment/react bar at bottom
- Tap highlight photo → open Photo Detail modal (full screen)
- Tap username → navigate to User Profile screen
- Tap Camera tab → open Camera screen (modal)
- Tap Profile tab → navigate to Profile screen
- Pull down → refresh feed and friend statuses
- Scroll down highlights → load more highlight photos (photos with 10+ reactions)
- Scroll right on friends → see more friends

**Friend Sorting Logic:**
1. Friends with NEW unseen photos (show red dot + "NEW" label)
2. Friends without new photos (alphabetical order)

**Highlights Criteria:**
- Photos with 10+ total reactions/comments
- From last 7 days only
- Sorted by engagement (reactions + comments count)

**Empty States:**
- No friends: "Add friends to see their photos"
- No highlights: "No highlights yet. When photos get lots of reactions, they'll appear here!"

---

## 4. Profile Screen (Your Profile)

```
┌─────────────────────────────────────────┐
│  [← Back]                    [⚙ Settings]│
│                                         │
│        ⭕ Profile Photo                 │
│                                         │
│           @username                     │
│    Your bio goes here...                │
│                                         │
│  ┌─────┬─────┬─────┐                   │
│  │ 127 │ 56  │ 234 │                   │
│  │Posts│Frnds│React│                   │
│  └─────┴─────┴─────┘                   │
│                                         │
│  [All Photos ▼]  [January 2026 ▼]      │
│                                         │
│  ┌───┬───┬───┐                          │
│  │ ▪ │ ▪ │ ▪ │  Photo Grid              │
│  ├───┼───┼───┤  (3 columns)             │
│  │ ▪ │ ▪ │ ▪ │  Square thumbnails       │
│  ├───┼───┼───┤                          │
│  │ ▪ │ ▪ │ ▪ │  [Journaled + Archived]  │
│  ├───┼───┼───┤                          │
│  │ ▪ │ ▪ │ ▪ │                          │
│  └───┴───┴───┘                          │
│                                         │
├─────────────────────────────────────────┤
│   👥      📷      👤                    │
│  Feed   Camera  Profile                 │
└─────────────────────────────────────────┘
```

**Key Elements:**
- Header: Back button (left), Settings icon (right)
- Profile section:
  - Profile photo (large circle, tap to edit)
  - Username
  - Bio text
  - Stats: Posts / Friends / Reactions
- Filter buttons:
  - "All Photos" dropdown (Journaled, Archived, All)
  - "January 2026" dropdown (monthly albums)
- Photo grid (3 columns, square thumbnails)
- Bottom tab navigation

**Interactions:**
- Tap Back → return to previous screen
- Tap Settings → navigate to Settings screen
- Tap profile photo → open photo picker to update
- Tap "All Photos" → show filter options (Journaled/Archived/All)
- Tap "January 2026" → show month picker
- Tap any photo → open Photo Detail modal
- Scroll down → load more photos
- Pull down → refresh photo grid

**Badges:**
- Small badges on developing photos: "Developing..." (gray overlay)

---

## 5. Friends Screen

```
┌─────────────────────────────────────────┐
│  [← Back]          Friends              │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  🔍 Search friends...             │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [Requests (3)] ────────────────────    │
│                                         │
│  ⭕ Jane Doe                 [Accept]   │
│     @janedoe                [Decline]  │
│                                         │
│  ⭕ Mike Smith               [Accept]   │
│     @mikesmith              [Decline]  │
│                                         │
│  [Friends] ──────────────────────────   │
│                                         │
│  ⭕ John Doe                    [📷]    │
│     @johndoe • 127 photos              │
│                                         │
│  ⭕ Sarah Wilson                [📷]    │
│     @sarahw • 89 photos                │
│                                         │
│  ⭕ Alex Johnson                [📷]    │
│     @alexj • 234 photos                │
│                                         │
│  [Scroll for more friends...]           │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │        + Add Friends              │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

**Key Elements:**
- Header: Back button, "Friends" title
- Search bar (search by username)
- Two sections:
  1. **Requests** (collapsed if 0)
     - Profile photo + name + username
     - Accept/Decline buttons (green/gray)
  2. **Friends** (alphabetically sorted)
     - Profile photo + name + username + photo count
     - Camera icon (view their photos)
- "Add Friends" button (bottom, fixed position)

**Interactions:**
- Tap search bar → keyboard appears, search as you type
- Tap Accept → friendship accepted → move to Friends section → show notification
- Tap Decline → friendship declined → remove from list
- Tap friend row → navigate to their User Profile screen
- Tap camera icon → navigate to Feed filtered to that friend
- Tap "Add Friends" → navigate to Add Friends screen (search all users)

**Empty States:**
- No requests: "Requests" section hidden
- No friends: "You don't have any friends yet. Tap + Add Friends to get started"

---

## Additional Screens (Quick Reference)

### Sign Up Screen
Similar to Login, with additional fields:
- Username (unique, lowercase)
- Display Name
- Email
- Password
- Confirm Password
- "Create Account" button
- "Already have an account? Login" link

### Friend Photo Viewer Modal
Full-screen modal when tapping a friend's thumbnail from Feed:
```
┌─────────────────────────────────────────┐
│ [X Close]        @username     [•••]    │
│                                         │
│                                         │
│                                         │
│                                         │
│           [FULL SCREEN PHOTO]           │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│  [← Prev]    3 / 12 photos    [Next →] │
│                                         │
│  Posted 2h ago                          │
│  😂 12  ❤️ 5  🔥 3                      │
│                                         │
│  💬 Comments (5)                        │
│  @alice: Love this! 😂                  │
│  @bob: Amazing shot                     │
│  [View all comments...]                 │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Add a comment...                 │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [😂] [❤️] [🔥] [✨] [💯] [👏]         │
│                                         │
└─────────────────────────────────────────┘
```

**Key Elements:**
- Close button (top-left)
- Username (top-center)
- More options menu (top-right): Report, Share, etc.
- Full-screen photo (swipeable)
- Navigation arrows and counter (e.g., "3 / 12 photos")
- Post timestamp
- Reaction counts
- Comments section (collapsed, showing top 2)
- Comment input box
- Reaction picker bar (6-8 emoji options)

**Interactions:**
- Swipe left → next photo (within last 7 days)
- Swipe right → previous photo
- Swipe down → close modal
- Tap [← Prev] / [Next →] → navigate photos
- Tap emoji → add/change your reaction (haptic feedback)
- Tap reaction count → see who reacted with what
- Tap "View all comments" → expand comments section
- Type in comment box → Send button appears
- Tap X Close → return to Feed

**Unseen Photo Logic:**
- If friend has unseen photos, opens to first unseen photo
- Marks photos as "seen" as user swipes through them
- Red dot on Feed disappears when all photos are seen

### Photo Detail Modal
Full-screen modal when tapping a highlight photo:
- Full-screen photo (swipe down to close)
- Username + time posted (bottom overlay)
- Reaction bar with 6-8 emoji options
- Current reactions shown below
- Comment section with all comments
- Swipe left/right to view other highlight photos

### Notifications Screen
List of notifications:
- Icon based on type (🔔 reveal, 👥 friend request, 😂 reaction)
- Message text
- Time ago
- Unread indicator (blue dot)
- Tap to navigate to relevant screen

### Settings Screen
List of settings:
- Edit Profile
- Notification Preferences
- Privacy Settings
- About
- Logout (red button at bottom)

---

## Design Tokens (For Implementation)

### Colors
- Primary: `#000000` (black)
- Secondary: `#FFFFFF` (white)
- Accent: `#FF4444` (red for delete/decline)
- Success: `#00AA00` (green for accept/confirm)
- Text Primary: `#000000`
- Text Secondary: `#666666`
- Border: `#E0E0E0`
- Background: `#FAFAFA`

### Typography
- Display (Logo): 32px, Bold
- H1 (Screen Titles): 24px, SemiBold
- H2 (Section Headers): 18px, SemiBold
- Body: 16px, Regular
- Caption: 14px, Regular
- Small: 12px, Regular

### Spacing
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px

### Borders
- Radius: 8px (buttons, inputs)
- Radius Large: 16px (cards)
- Width: 1px

### Shadows (Cards)
```javascript
{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3, // Android
}
```

---

## Navigation Flow

```
Login Screen
  ├─→ Sign Up Screen → Profile Setup → Feed Screen
  └─→ Feed Screen (if already logged in)

Feed Screen (Tab 1)
  ├─→ Notifications Screen
  ├─→ Photo Detail Modal
  ├─→ User Profile Screen
  └─→ Camera Screen (Tab 2)

Camera Screen (Tab 2 - Modal)
  ├─→ Photo Preview
  └─→ Profile Screen (Tab 3)

Profile Screen (Tab 3)
  ├─→ Settings Screen
  ├─→ Photo Detail Modal
  └─→ Friends Screen
      ├─→ Add Friends Screen
      └─→ User Profile Screen
```

---

**Document Status:** Ready for UI implementation
**Next Steps:**
1. Create reusable UI components (Button, Input, Card)
2. Implement navigation structure
3. Build placeholder screens following these wireframes