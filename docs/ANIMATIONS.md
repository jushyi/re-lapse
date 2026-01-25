# Animation System

This document describes the card-based photo triage animation system used in the Darkroom. The system provides a tactile, responsive experience for sorting photos into Archive, Journal, or Delete.

## Overview

The triage UX presents photos as a stack of cards. Users swipe left to archive, right to journal, or use the delete button to discard. The animation system creates fluid, natural-feeling card motion with:

- Arc trajectories that mimic flicking cards from a deck
- Haptic feedback at key interaction points
- Visual overlays that communicate the intended action
- Cascade animations where background cards advance smoothly

Core implementation: `src/hooks/useSwipeableCard.js`

## Card Stack System

The stack displays 3 visible cards at once. Only the front card (index 0) responds to gestures.

### Stack Styling

| Index | Role           | Scale | Y Offset | Opacity |
| ----- | -------------- | ----- | -------- | ------- |
| 0     | Front (active) | 1.0   | 0        | 1.0     |
| 1     | Behind         | 0.96  | -20      | 0.85    |
| 2     | Furthest back  | 0.92  | -40      | 0.70    |

Negative Y offset means cards peek from the top (above the front card). This gives visual depth without obscuring the front card's content.

### Why Cards Peek from Top

Cards use negative offset to appear above the front card rather than below. This matches the mental model of a face-down deck where you're flipping through from the top. The slight scale reduction and opacity fade create depth without requiring shadows or blur effects.

## Swipe Gesture

### Arc Motion

Cards follow a downward curve as they move horizontally, defined by:

```
y = 0.4 * |x|
```

This creates a natural "flicking" feel. The multiplier (0.4) was tuned to feel like cards falling off the edge of a table.

### Rotation

Cards tilt in the direction of the swipe. The rotation is linear based on horizontal position:

```
rotation = translateX / 15 (in degrees)
```

At 150px horizontal displacement, the card tilts 10 degrees.

### Color Overlays

Action-specific overlays fade in during the swipe to communicate intent:

| Direction | Action  | Color | Icon      |
| --------- | ------- | ----- | --------- |
| Left      | Archive | Gray  | Box icon  |
| Right     | Journal | Green | Checkmark |
| Down      | Delete  | Red   | X icon    |

Overlay opacity is calculated as:

```
opacity = interpolate(|x|, [0, THRESHOLD], [0, 0.7])
```

### Threshold

Action triggers at 100px horizontal displacement. This distance was chosen to be:

- Large enough to prevent accidental triggers
- Small enough to feel responsive on a phone screen

Velocity threshold (500px/s) allows fast flicks to trigger even below distance threshold.

## Exit Animation

When an action triggers, the card animates off-screen with an exponential arc.

### Duration

- Swipe gestures: 800ms
- Button triggers: 800ms

The duration was increased from an initial 250ms to make the arc motion visible and satisfying.

### Exponential Arc

The exit path uses an exponential curve (x^2.5) rather than linear:

```javascript
const normalizedX = Math.abs(translateX) / (SCREEN_WIDTH * 1.5);
const curveProgress = Math.pow(normalizedX, 2.5);
const arcY = SCREEN_HEIGHT * 0.5 * curveProgress;
```

The exponential curve means cards start moving mostly horizontally, then accelerate downward as they exit. This creates a "thrown" feel rather than a rigid diagonal path.

### Cascade Trigger

Background cards begin advancing 100ms after the exit animation starts (not after it completes). This creates fluid, parallel motion where the stack appears to continuously flow rather than move in discrete steps.

The 100ms delay provides enough clearance for the exiting card to be clearly moving before the next card starts its transition, preventing visual collision.

## Undo/Entry Animation

When a photo is restored via Undo, it animates back in from the direction it exited.

### Entry Duration

400ms - Fast enough to feel responsive, slow enough to be visible.

### Entry Direction

Photos enter from their exit direction:

- Archived (left exit) slides in from left
- Journaled (right exit) slides in from right
- Deleted (down exit) slides in from bottom

The card starts at 1.5x screen width/height off-screen and animates to center position using `Easing.out(Easing.cubic)` for a decelerating settle.

## Timing Decisions

The animation timing values evolved through user acceptance testing (UAT). Key decisions:

### Exit Duration: 800ms (Phase 18.4)

Initial value was 250ms. Increased to 800ms to make the exponential arc motion visible. Fast exits felt abrupt and mechanical; slower exits feel satisfying.

### Cascade Delay: 100ms (Phase 18.6)

Determines when background cards start advancing. Initial approach waited for exit completion, causing noticeable pauses. The 100ms "clearance" delay triggers cascade while the exit is still in progress, creating fluid parallel motion.

### Stack Offset: -20/-40px (Phase 17-FIX-2)

Cards peek from the top. Positive offset (below) felt like a queue; negative offset (above) feels like flipping through a deck.

### Spring Animation (Phase 18.1-FIX-4)

When swipe doesn't meet threshold, card springs back with:

- Damping: 18
- Stiffness: 100

This creates gradual settling rather than snappy bounce, which felt jarring during rapid swipes.

### Delete Suction: 450ms (Phase 18.3)

Button-triggered delete uses a "suction" effect where the card shrinks (scale 1.0 to 0.1) while moving toward the delete button position. Uses `Easing.in(Easing.cubic)` for accelerating motion, creating a "pulled in" feel.

### Front Card Transition Delay: 0ms (Phase 18.6)

After switching to 100ms clearance-based cascade, the front card transition delay was reduced to 0ms since the cascade now triggers based on clearance rather than completion.

---

_Last updated: 2026-01-25_
