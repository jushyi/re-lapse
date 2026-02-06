# Phase 4: Profile Creation Onboarding - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<vision>
## How This Should Work

The profile creation flow already has two screens (ProfileSetupScreen and SelectsScreen), but they need polish to feel cohesive and intuitive.

**ProfileSetupScreen (Step 1 of 2):**
The current two buttons ("Complete" and "Skip") should be consolidated into a single "Next step" button. The validation for required fields (display name and username) stays — if users try to continue without them, outline the fields in red and show an alert. When they tap "Next step", a smooth horizontal slide animation takes them to the Selects screen.

**SelectsScreen (Step 2 of 2):**
A complete redesign. The title becomes "Pick Your Highlights" with subtitle "Choose up to 10 photos to highlight on your profile."

On first visit (no photos selected), there's a large gray box with a dotted outline that says "Tap to add photos" with a photo icon. This box takes up most of the screen because it's also where selected photos preview.

After selecting photos, the first photo shows in that preview area. Tapping any thumbnail in the bottom strip makes that photo the preview.

At the bottom is a horizontal scrollable thumbnail strip showing all 10 slots — selected photos fill slots from the left, empty slots show a plus icon for adding more. The thumbnails are small rectangles matching the preview's aspect ratio.

Users can drag thumbnails to reorder them. When dragging, a red delete bar with a trash icon appears below — dropping a photo there removes it. There's a hint popup and subtle animation teaching this interaction, which shows every visit until they actually perform a drag action.

The system photo picker opens when tapping the placeholder or empty slots — one photo at a time.

A single "Complete Profile Setup" button at the bottom. If no photos are selected, tapping it shows a confirmation: "Are you sure you want to skip selecting highlights? This can always be done later in the profile tab" with cancel and skip options.

When users return to this screen later (from profile), their previously saved Selects load so they can edit them.

Both screens show step dots (1 of 2, 2 of 2) to indicate progress.

</vision>

<essential>
## What Must Be Nailed

- **Preview + thumbnail interaction** — Tapping thumbnails updates the preview, the connection feels immediate and responsive
- **Drag-and-drop reordering** — Intuitive, smooth, with clear visual feedback
- **Cohesive flow feel** — Both screens feel like one unified onboarding experience with consistent styling and smooth transitions
- **Clear empty/add states** — Users immediately understand how to add their first photo and add more

</essential>

<boundaries>
## What's Out of Scope

- Profile screen display of Selects — that's Phase 6 (Selects Banner)
- Photo editing/cropping — just selection and ordering
- Changes to song selection section — keep as-is, Phase 7 will address it
- Phase 10 (Selects UI Enhancements) — this work is being pulled into Phase 4

</boundaries>

<specifics>
## Specific Ideas

- Match existing dark theme aesthetic throughout
- System photo picker (standard iOS/Android modal), one photo at a time
- All 10 thumbnail slots always visible (shows progress toward max)
- Red delete bar with trash icon appears when dragging
- Hint popup + pulling animation to teach drag-and-drop
- Hint shows every visit until user actually performs a drag
- Subtle slide animation between ProfileSetupScreen and SelectsScreen
- Step dots at top of both screens showing 1/2 and 2/2

</specifics>

<notes>
## Additional Context

The user's vision pulls forward the drag-and-drop reordering and 10-photo limit from Phase 10 into this phase. Phase 10 in the roadmap may need to be removed or repurposed.

The skip confirmation popup text: "Are you sure you want to skip selecting highlights? This can always be done later in the profile tab" with Cancel and Skip buttons.

Selects persist — returning to the screen loads previously saved photos for editing.

</notes>

---

_Phase: 04-profile-creation-onboarding_
_Context gathered: 2026-01-27_
