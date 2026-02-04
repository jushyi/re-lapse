# Codebase Tour

Before writing code, let's understand how this project is organized.

## Project Structure

```
lapse-clone/
├── src/                    # All app source code
│   ├── components/         # Reusable UI pieces
│   ├── constants/          # Colors, spacing, config values
│   ├── context/            # Global state (auth, theme)
│   ├── hooks/              # Custom React hooks
│   ├── navigation/         # Screen routing
│   ├── screens/            # Full-page components
│   ├── services/           # Firebase API calls
│   ├── styles/             # StyleSheet definitions
│   └── utils/              # Helper functions
├── App.js                  # App entry point
└── package.json            # Dependencies
```

## Key Files to Explore

Open each of these files and read through them:

### 1. `App.js` - The Entry Point

This is where the app starts. Notice:

- Provider components wrapping the app (AuthProvider, ThemeProvider)
- How the navigation is loaded

### 2. `src/navigation/AppNavigator.js` - Routing

This controls which screens are shown. Notice:

- Tab navigation (Feed, Camera, Profile)
- Stack screens that can be pushed on top
- How screens are imported and registered

### 3. `src/constants/colors.js` - The Color System

This is Phase 16's work that we're building on. Notice:

- Hierarchical organization (background, text, brand, etc.)
- How colors are exported
- The documentation comments explaining usage

### 4. `src/context/ThemeContext.js` - Theme State

This manages the current theme. Notice:

- How React Context works (createContext, Provider, useContext)
- AsyncStorage for persistence
- The current palette system (we'll expand this)

### 5. `src/components/FeedPhotoCard.js` - Example Component

A typical component in this codebase. Notice:

- Functional component with hooks
- Props destructuring
- StyleSheet.create() at the bottom
- How colors are imported and used

## Patterns to Follow

### Component Structure

```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const MyComponent = ({ someProp, anotherProp }) => {
  // Hook calls at the top
  const [state, setState] = useState(null);

  // Event handlers
  const handlePress = () => {
    // ...
  };

  // Render
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{someProp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  text: {
    color: colors.text.primary,
  },
});

export default MyComponent;
```

### Naming Conventions

| Type       | Convention          | Example             |
| ---------- | ------------------- | ------------------- |
| Components | PascalCase          | `ThemeCard.js`      |
| Screens    | PascalCase + Screen | `SettingsScreen.js` |
| Hooks      | camelCase + use     | `useTheme.js`       |
| Constants  | UPPER_SNAKE_CASE    | `DEFAULT_THEME_ID`  |
| Functions  | camelCase           | `handlePress`       |

### Using Colors

Always import from constants, never hardcode:

```javascript
// ✅ Good
import { colors } from '../constants/colors';
backgroundColor: colors.background.primary;

// ❌ Bad
backgroundColor: '#000000';
```

## Exercise: Find These Things

Before moving on, find in the codebase:

1. Where is the Settings screen? What file?
2. How many tabs are in the bottom navigation?
3. What does `useTheme()` return?
4. Where are screens registered in the navigator?

<details>
<summary>Answers</summary>

1. `src/screens/SettingsScreen.js`
2. 3 tabs (Feed, Camera, Profile)
3. `{ theme, currentPalette, setPalette, palettes, initializing }`
4. In `src/navigation/AppNavigator.js` inside `Stack.Navigator`

</details>

---

**Next:** [02-THEME-CARD.md](./02-THEME-CARD.md) - Building your first component
