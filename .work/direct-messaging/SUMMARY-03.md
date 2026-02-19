---
plan: 03
title: "Tab Bar Icon + Badge Support"
status: success
completed: 2026-02-19
commits:
  - 0fbe9cb feat(dm): add tab-messages pixel icon for Messages tab
  - 6539ffe feat(dm): add Messages tab icon and unread badge to CustomBottomTabBar
---

## What was done

### Task 1: Add tab-messages pixel icon
- Added a `tab-messages` icon to `src/constants/pixelIcons.js` in the TAB BAR section
- Icon is a 12x12 pixel grid (matches `tab-feed`, `tab-camera`, `tab-profile` dimensions)
- Design is a speech bubble outline with a small tail at bottom-left (26 filled pixels)
- Style matches `tab-camera` which is also outlined rather than filled

### Task 2: Update CustomBottomTabBar for Messages tab + badge
- Added `Text` to the React Native import
- Added `totalUnreadCount` prop (defaults to 0) to the component signature
- Added `Messages` route rendering between Feed and Camera, using `tab-messages` PixelIcon
- Added unread badge overlay that appears when `totalUnreadCount > 0`
- Badge displays numeric count, capped at "99+" for counts over 99
- Badge styled with `colors.interactive.primary` (#00D4FF) background and `colors.text.inverse` text
- No layout changes needed -- existing `flex: 1` on `tabButton` auto-distributes for any number of tabs

## Files modified
- `src/constants/pixelIcons.js` -- added `tab-messages` icon grid data
- `src/components/CustomBottomTabBar.js` -- added Messages tab rendering + unread badge

## Verification
- [x] `npm run lint` passes (0 errors; 116 pre-existing warnings unrelated to this plan)
- [x] `tab-messages` icon exists in ICON_GRIDS with correct 12x12 grid format
- [x] `getIconData('tab-messages')` returns valid data
- [x] CustomBottomTabBar accepts `totalUnreadCount` prop
- [x] Badge renders when `totalUnreadCount > 0` with count display (capped at "99+")
- [x] Badge uses `colors.interactive.primary` background (#00D4FF)
- [x] Existing Feed, Camera, and Profile tabs render identically to before
- [x] `flex: 1` layout unchanged -- 4 tabs auto-distribute

## Deviations
None. Implementation matches the plan exactly.
