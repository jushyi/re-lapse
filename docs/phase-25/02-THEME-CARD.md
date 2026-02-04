# Building the ThemeCard Component

Your first task is creating a reusable component that displays a theme preview. This card will be used in the theme selection UI.

## What You'll Build

A card that shows:

- A mini preview of 5 theme colors
- The theme name
- A selected/unselected state

## Component Requirements

**Props:**

- theme: `{ id, name, colors: { background, card, text, accent, accentSecondary } }`
- isSelected: boolean
- onPress: function

**Visual:**

- Card dimensions: ~100x140 pixels
- Shows all 5 colors in the preview area
- Purple border when selected
- Subtle border when not selected

## Step 1: Create the File

Create a new file at `src/components/ThemeCard.js`:

```javascript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const ThemeCard = ({ theme, isSelected, onPress }) => {
  // We'll fill this in
  return null;
};

const styles = StyleSheet.create({
  // We'll add styles
});

export default ThemeCard;
```

## Step 2: Build the Structure

**Try it yourself first!** Think about:

- What's the outer wrapper? (Hint: needs to respond to taps)
- How will you show the 5 colors?
- Where does the theme name go?

<details>
<summary>Hint</summary>

The structure should be:

```
TouchableOpacity (card wrapper)
  └── View (preview area)
      ├── View (color row - accent, accentSecondary, text)
      └── View (color row - card, background)
  └── Text (theme name)
```

</details>

<details>
<summary>Solution</summary>

```javascript
const ThemeCard = ({ theme, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Color preview area */}
      <View style={[styles.preview, { backgroundColor: theme.colors.background }]}>
        {/* Top row: accent colors + text */}
        <View style={styles.colorRow}>
          <View style={[styles.colorSwatch, { backgroundColor: theme.colors.accent }]} />
          <View style={[styles.colorSwatch, { backgroundColor: theme.colors.accentSecondary }]} />
          <View style={[styles.colorSwatch, { backgroundColor: theme.colors.text }]} />
        </View>
        {/* Card color strip */}
        <View style={[styles.cardStrip, { backgroundColor: theme.colors.card }]} />
      </View>

      {/* Theme name */}
      <Text style={styles.themeName}>{theme.name}</Text>
    </TouchableOpacity>
  );
};
```

</details>

## Step 3: Add the Styles

**Try it yourself!** Create styles for:

- `card`: The outer container with border
- `cardSelected`: Purple border for selected state
- `preview`: The color preview area
- `colorRow`: Horizontal row of color swatches
- `colorSwatch`: Individual small color square
- `cardStrip`: Horizontal bar showing card color
- `themeName`: Text styling

<details>
<summary>Hints</summary>

- Use `borderWidth: 2` for the card border
- For unselected, use `borderColor: colors.border.subtle`
- For selected, use `borderColor: colors.interactive.primary`
- Color swatches can be ~20x20 pixels
- The card strip can be ~8 pixels tall

</details>

<details>
<summary>Solution</summary>

```javascript
const styles = StyleSheet.create({
  card: {
    width: 100,
    backgroundColor: colors.background.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.subtle,
    overflow: 'hidden',
    marginRight: 12,
    marginBottom: 12,
  },
  cardSelected: {
    borderColor: colors.interactive.primary,
  },
  preview: {
    padding: 8,
    height: 80,
    justifyContent: 'space-between',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  cardStrip: {
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  themeName: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
```

</details>

## Step 4: Test Your Component

Temporarily add this to `src/screens/ProfileScreen.js` to test:

```javascript
// At the top, add:
import ThemeCard from '../components/ThemeCard';

// Inside the render, add temporarily:
<View style={{ padding: 20 }}>
  <ThemeCard
    theme={{
      id: 'dark',
      name: 'Dark',
      colors: {
        background: '#000000',
        card: '#111111',
        text: '#FFFFFF',
        accent: '#8B5CF6',
        accentSecondary: '#EC4899',
      },
    }}
    isSelected={true}
    onPress={() => console.log('Tapped!')}
  />
</View>;
```

### Verify:

- [ ] Card renders without errors
- [ ] All 5 colors are visible
- [ ] Theme name "Dark" appears
- [ ] Card has purple border (selected)
- [ ] Tapping logs "Tapped!" to console

### Test unselected state:

Change `isSelected={true}` to `isSelected={false}` and verify the border changes.

**Don't forget:** Remove the test code from ProfileScreen before moving on!

## Key Learnings

1. **Conditional styling:** `[styles.base, condition && styles.conditional]`
2. **TouchableOpacity:** Makes any view tappable
3. **Dynamic styles:** `{ backgroundColor: theme.colors.accent }`
4. **StyleSheet.create():** Always use this for performance

---

**Next:** [03-THEME-SYSTEM.md](./03-THEME-SYSTEM.md) - Expanding the theme context
