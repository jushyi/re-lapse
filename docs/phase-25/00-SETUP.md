# Environment Setup

This guide walks you through setting up your development environment for React Native development.

## Required Software

### 1. Node.js (v18 or later)

**macOS:**

```bash
# Using Homebrew
brew install node

# Verify installation
node --version  # Should show v18.x.x or higher
npm --version
```

**Windows:**
Download from [nodejs.org](https://nodejs.org/) and run the installer.

### 2. Git

**macOS:**

```bash
# Usually pre-installed, or:
brew install git

# Configure your identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**Windows:**
Download from [git-scm.com](https://git-scm.com/) and run the installer.

### 3. Code Editor

We recommend [VS Code](https://code.visualstudio.com/) with these extensions:

- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint

### 4. Development Build (on your device)

You'll run the app on your physical device using a development build (not Expo Go). This gives you access to all native features like the camera.

**Getting the build:**

1. Contact the project owner to register your device
2. You'll receive a link to install the development build
3. Install the app on your device (you may need to trust the developer certificate in Settings)

> **Note:** The development build is different from Expo Go. It's a custom build of the actual app with developer tools enabled.

## Project Setup

### Clone the Repository

```bash
cd ~/Projects  # or your preferred location
git clone [repository-url]
cd "Lapse Clone"
```

### Install Dependencies

```bash
npm install
```

This may take a few minutes. You should see no errors at the end.

### Start the Development Server

```bash
npx expo start --dev-client
```

You'll see a QR code in the terminal.

**To run on your device:**

1. Make sure your phone is on the same WiFi network as your computer
2. Open the development build app on your device
3. The app will automatically connect to the dev server, or scan the QR code if prompted

### Verify It Works

You should see the Rewind app load with:

- A camera interface or feed screen
- Bottom tab navigation
- Dark theme throughout

**Troubleshooting:**

| Issue                         | Solution                                                     |
| ----------------------------- | ------------------------------------------------------------ |
| "command not found: npx"      | Reinstall Node.js                                            |
| App won't connect to server   | Ensure phone and computer are on the same WiFi network       |
| "Unable to connect" on device | Try running `npx expo start --dev-client --tunnel`           |
| App not installed             | Contact project owner to add your device and get a new build |
| Metro bundler crashes         | Delete `node_modules` and run `npm install` again            |

## Development Workflow

### Hot Reload

When you save a file, the app automatically reloads. This is called "hot reload" and makes development fast. You can also manually reload by shaking the phone or long pressing the screen with three fingers which opens the dev menu.

### Viewing Logs

In the terminal where Expo is running, you'll see:

- Console.log output from your code
- Error messages with stack traces
- Network requests (in verbose mode)

### Stopping the Server

Press `Ctrl+C` in the terminal to stop Expo.

---

**Next:** [01-CODEBASE-TOUR.md](./01-CODEBASE-TOUR.md) - Understanding the project structure
