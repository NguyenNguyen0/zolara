# 📱 Zolara Mobile

<div align="center">
  <img src="./src/assets/images/brand/zolara.png" alt="Zolara Logo" width="200"/>
  
  <p><strong>Modern Social Messaging Platform</strong></p>
  
  [![Expo](https://img.shields.io/badge/Expo-54.0.25-blue.svg)](https://expo.dev)
  [![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61dafb.svg)](https://reactnative.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-Private-red.svg)]()
</div>

---

## 📋 Table of Contents

- [Introduction](#-introduction)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Requirements](#-system-requirements)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the App](#-running-the-app)
- [Building](#-building)
- [Project Structure](#-project-structure)
- [Scripts](#-scripts)
- [Architecture](#-architecture)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 🌟 Introduction

**Zolara Mobile** is a cross-platform mobile application (iOS, Android, Web) built with React Native and Expo. The app provides real-time messaging, social networking, and many modern interactive features.

### Key Highlights

- 🚀 **High Performance** with React Native New Architecture
- 🎨 **Beautiful UI** with TailwindCSS and GluestackUI
- 💬 **Real-time Messaging** with Socket.IO
- 📞 **Video/Audio Calls** with WebRTC
- 🤖 **AI Chatbot** Integration
- 🌙 **Auto Dark Mode**
- 📱 **Cross-platform** - iOS, Android, Web

---

## ✨ Features

### 🔐 Authentication & Security
- ✅ Email registration/login
- ✅ OTP verification via email
- ✅ Password recovery
- ✅ Secure token storage with Expo Secure Store

### 💬 Messaging
- ✅ Text messages with emoji support
- ✅ Send images, videos, audio
- ✅ Document sharing
- ✅ Voice messages
- ✅ Message forwarding
- ✅ Reply to messages
- ✅ Delete and recall messages
- ✅ Emoji reactions
- ✅ Read receipts and delivery status
- ✅ Typing indicators

### 👥 Group Management
- ✅ Create group chats
- ✅ Add/remove members
- ✅ Admin permissions
- ✅ Change group name and avatar
- ✅ Leave group

### 📞 Calling
- ✅ 1-to-1 voice/video calls
- ✅ Group calls
- ✅ WebRTC integration

### 🤖 AI Features
- ✅ AI chatbot assistant
- ✅ AI image generation
- ✅ Image analysis

### 📰 Social Network
- ✅ Create posts
- ✅ Like, comment, share
- ✅ Upload photos/videos
- ✅ Personalized news feed

### 👤 Account Management
- ✅ Update personal information
- ✅ Change avatar
- ✅ Privacy settings
- ✅ Notification management

### 📱 Other Features
- ✅ Contact sync
- ✅ QR Code for friend requests
- ✅ User search
- ✅ Push notifications
- ✅ Background tasks
- ✅ Offline mode
- ✅ Multi-language support

---

## 🛠 Tech Stack

### Core Technologies
- **[React Native 0.81.5](https://reactnative.dev/)** - Core framework
- **[Expo SDK 54](https://expo.dev/)** - Development platform
- **[TypeScript 5.9.2](https://www.typescriptlang.org/)** - Type safety
- **[Expo Router](https://docs.expo.dev/router/introduction/)** - File-based routing

### UI & Styling
- **[NativeWind](https://www.nativewind.dev/)** - TailwindCSS for React Native
- **[GluestackUI](https://gluestack.io/)** - Component library
- **[Lucide Icons](https://lucide.dev/)** - Icon library
- **[React Native Elements](https://reactnativeelements.com/)** - Additional components

### State Management
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management
- **[React Context](https://react.dev/reference/react/useContext)** - Global state

### Networking & Communication
- **[Axios](https://axios-http.com/)** - HTTP client
- **[Socket.IO Client](https://socket.io/docs/v4/client-api/)** - Real-time communication
- **[React Native WebRTC](https://github.com/react-native-webrtc/react-native-webrtc)** - Video/Audio calls

### Media & Files
- **[Expo Image](https://docs.expo.dev/versions/latest/sdk/image/)** - Optimized images
- **[Expo Video](https://docs.expo.dev/versions/latest/sdk/video/)** - Video playback
- **[Expo AV](https://docs.expo.dev/versions/latest/sdk/av/)** - Audio/Video
- **[Expo Camera](https://docs.expo.dev/versions/latest/sdk/camera/)** - Camera access
- **[Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)** - Pick images/videos
- **[Expo Document Picker](https://docs.expo.dev/versions/latest/sdk/document-picker/)** - Pick documents

### Utilities
- **[Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)** - Push notifications
- **[Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/securestore/)** - Secure storage
- **[Expo Contacts](https://docs.expo.dev/versions/latest/sdk/contacts/)** - Access contacts
- **[Expo Background Fetch](https://docs.expo.dev/versions/latest/sdk/background-fetch/)** - Background tasks
- **[NetInfo](https://github.com/react-native-netinfo/react-native-netinfo)** - Network status

### Development Tools
- **[Prettier](https://prettier.io/)** - Code formatting
- **[ESLint](https://eslint.org/)** - Code linting
- **[Husky](https://typicode.github.io/husky/)** - Git hooks
- **[Lint-staged](https://github.com/okonet/lint-staged)** - Pre-commit linting
- **[Jest](https://jestjs.io/)** - Testing framework

---

## 💻 System Requirements

### Development
- **Node.js**: >= 18.0.0
- **npm** or **yarn** or **pnpm**
- **Git**: >= 2.0.0
- **EAS CLI**: >= 16.23.0 (optional, for production builds)

### For iOS Development
- **macOS**: 12.0 or higher
- **Xcode**: 14.0 or higher
- **iOS Simulator** or **iOS device** (iOS 13.0+)
- **CocoaPods**: >= 1.11.0

### For Android Development
- **Android Studio**: Arctic Fox or higher
- **Android SDK**: API Level 23 (Android 6.0) or higher
- **JDK**: 17 (recommended)
- **Android Emulator** or **Android device**

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/NguyenNguyen0/zolara.git
cd zolara/zolara-mobile
```

### 2. Install dependencies

```bash
# Using npm
npm install

# Or yarn
yarn install

# Or pnpm
pnpm install
```

### 3. Install Expo CLI (if not already installed)

```bash
npm install -g expo-cli
```

### 4. Install EAS CLI (for production builds)

```bash
npm install -g eas-cli
```

### 5. Login to Expo (if you don't have an account)

```bash
expo login
# or
eas login
```

---

## ⚙️ Configuration

### 1. Create environment file

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 2. Configure environment variables

Edit the `.env` file:

```env
# API URL - Backend server URL
EXPO_PUBLIC_API_URL=https://your-backend-url.com/api/v1

# Or for local development
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
```

> **Note**: 
> - For Android Emulator: use `http://10.0.2.2:3000/api/v1`
> - For iOS Simulator on same machine: use `http://localhost:3000/api/v1`
> - For physical devices: use your computer's LAN IP address

### 3. Configure EAS (for production builds)

The `eas.json` file is pre-configured with the following profiles:

- **development**: Development build with dev client
- **preview**: APK/IPA build for internal testing
- **production**: Production build (App Bundle/IPA)
- **apk**: APK build for Android

---

## 🏃 Running the App

### Development Mode

#### Run on multiple platforms

```bash
# Start Metro bundler
npm start

# Or with options
npm start -- --clear  # Clear cache
```

Then select platform:
- Press `a` - Open Android
- Press `i` - Open iOS
- Press `w` - Open Web

#### Run directly on specific platform

```bash
# Android
npm run android

# iOS (macOS only)
npm run ios

# Web
npm run web
```

### With Expo Go App

1. Install **Expo Go** on your phone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Run the app:
   ```bash
   npm start
   ```

3. Scan the QR code with Expo Go app

> **Note**: Some features like WebRTC and Background tasks may not work on Expo Go. You need to build a development client.

### Development Build (Recommended)

```bash
# Build development client for Android
eas build --profile development --platform android

# Build development client for iOS
eas build --profile development --platform ios

# Install the build on your device and run
npm start --dev-client
```

---

## 📦 Building

### Preview Build (Internal Testing)

```bash
# Android APK
eas build --profile preview --platform android

# iOS (requires Apple Developer Account)
eas build --profile preview --platform ios
```

### Production Build

```bash
# Android App Bundle (for Google Play)
eas build --profile production --platform android

# iOS (for App Store)
eas build --profile production --platform ios

# Build both platforms
eas build --profile production --platform all
```

### Build standalone APK (not for store)

```bash
eas build --profile apk --platform android
```

### Local Build (without EAS)

```bash
# Android
npx expo run:android --variant release

# iOS
npx expo run:ios --configuration Release
```

---

## 📁 Project Structure

```
zolara-mobile/
├── app/                          # Expo Router - File-based routing
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # Entry screen
│   ├── +not-found.tsx           # 404 page
│   └── (screens)/               # Screen groups
│       ├── (auth)/              # Authentication screens
│       │   ├── welcome.tsx
│       │   ├── login.email.tsx
│       │   ├── signup.*.tsx
│       │   └── verify.tsx
│       ├── (tabs)/              # Main tab screens
│       │   ├── index.tsx        # Home/Chat
│       │   ├── contacts/        # Contacts tab
│       │   ├── discover/        # Discover tab
│       │   ├── news/            # News feed tab
│       │   └── info/            # Profile tab
│       └── (user)/              # User-specific screens
│           ├── chat/            # Chat screens
│           ├── chatbot/         # AI chatbot
│           ├── friend/          # Friend management
│           ├── group/           # Group management
│           ├── info/            # User info
│           └── settings/        # Settings
│
├── src/
│   ├── assets/                  # Static assets
│   │   ├── fonts/              # Custom fonts
│   │   ├── images/             # Images
│   │   ├── sounds/             # Sound files
│   │   └── svgs/               # SVG icons
│   │
│   ├── components/              # Reusable components
│   │   ├── chat/               # Chat-related components
│   │   ├── customize/          # Customization components
│   │   ├── post/               # Post components
│   │   └── ui/                 # UI components
│   │
│   ├── constants/               # Constants & configurations
│   │   └── Colors.ts
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useSocket.ts
│   │   ├── useColorScheme.ts
│   │   └── useThemeColor.ts
│   │
│   ├── lib/                     # External libraries config
│   │   ├── axios.ts            # Axios configuration
│   │   └── socket.ts           # Socket.IO configuration
│   │
│   ├── providers/               # Context providers
│   │   └── SocketProvider.tsx
│   │
│   ├── services/                # API services
│   │   ├── agent-service.ts
│   │   ├── conversation-service.ts
│   │   ├── friend-service.ts
│   │   ├── group-service.ts
│   │   ├── message-service.ts
│   │   ├── notification-service.ts
│   │   ├── post-service.ts
│   │   ├── user-service.ts
│   │   └── call/               # Call services
│   │
│   ├── store/                   # Zustand stores
│   │   ├── authStore.ts
│   │   ├── chatStore.ts
│   │   ├── conversationsStore.ts
│   │   ├── agentStore.ts
│   │   └── userStatusStore.ts
│   │
│   ├── tasks/                   # Background tasks
│   │   └── background-tasks.ts
│   │
│   ├── types/                   # TypeScript types
│   │   └── index.ts
│   │
│   ├── utils/                   # Utility functions
│   │   ├── constants.ts
│   │   └── convertHelper.ts
│   │
│   └── global.css              # Global styles (TailwindCSS)
│
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── app.json                     # Expo configuration
├── eas.json                     # EAS Build configuration
├── package.json                 # Dependencies
├── tailwind.config.js          # TailwindCSS config
├── tsconfig.json               # TypeScript config
└── README.md                   # Documentation
```

---

## 📜 Scripts

### Development
```bash
npm start              # Start Metro bundler
npm run android        # Run on Android
npm run ios            # Run on iOS
npm run web            # Run on Web
```

### Code Quality
```bash
npm run lint           # Run ESLint
npm run test           # Run tests with Jest
npm run prepare        # Setup Husky hooks
```

### Building
```bash
npm run build          # Production build
```

### Utilities
```bash
npm run reset-project  # Reset project (clean install)
```

---

## 🏗 Architecture

### Routing - Expo Router

The app uses **Expo Router** with file-based routing:

```
app/
├── _layout.tsx              → Common layout
├── index.tsx                → Entry point (/)
├── (screens)/
│   ├── (auth)/
│   │   └── login.tsx        → /login
│   └── (tabs)/
│       ├── _layout.tsx      → Tab layout
│       └── index.tsx        → /home
```

### State Management

#### Zustand Stores
```typescript
// authStore.ts - Authentication state
- user: User | null
- token: string | null
- login(), logout(), updateUser()

// chatStore.ts - Chat state
- messages: Message[]
- activeChat: string | null
- sendMessage(), receiveMessage()

// conversationsStore.ts - Conversations
- conversations: Conversation[]
- updateConversation(), deleteConversation()
```

#### Context API
```typescript
// SocketProvider - Socket.IO connection
- socket instance
- connection status
- event listeners
```

### API Layer

```typescript
// services/user-service.ts
export const userService = {
  getProfile: () => axios.get('/users/profile'),
  updateProfile: (data) => axios.put('/users/profile', data),
  // ...
}

// Usage in component
import { userService } from '@/services/user-service';

const profile = await userService.getProfile();
```

### Real-time Communication

```typescript
// Socket.IO Events
socket.on('message:new', handleNewMessage);
socket.on('user:online', handleUserOnline);
socket.on('typing', handleTyping);

// WebRTC for Calls
import { RTCPeerConnection } from 'react-native-webrtc';
```

---

## 🧪 Testing

### Running tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- MessageBubble.test.tsx
```

### Test structure

```typescript
// components/__tests__/MessageBubble.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import MessageBubble from '../MessageBubble';

describe('MessageBubble', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <MessageBubble message="Hello" />
    );
    expect(getByText('Hello')).toBeTruthy();
  });
});
```

---

## 🚀 Deployment

### Android - Google Play Store

1. **Preparation**
   ```bash
   # Update version in app.json
   # Create signing key (first time)
   ```

2. **Build**
   ```bash
   eas build --profile production --platform android
   ```

3. **Submit**
   ```bash
   eas submit --platform android
   ```

### iOS - App Store

1. **Requirements**
   - Apple Developer Account ($99/year)
   - App Store Connect setup

2. **Build**
   ```bash
   eas build --profile production --platform ios
   ```

3. **Submit**
   ```bash
   eas submit --platform ios
   ```

### Over-The-Air Updates (OTA)

```bash
# Publish update (no rebuild required)
eas update --branch production --message "Fix bug"
```

---

## 🔧 Troubleshooting

### Metro bundler cache issues

```bash
# Clear cache and restart
npm start -- --reset-cache

# Or
npx expo start -c
```

### Android build fails

```bash
# Clean gradle
cd android
./gradlew clean
cd ..

# Rebuild
npm run android
```

### iOS build fails

```bash
# Reinstall pods
cd ios
pod deintegrate
pod install
cd ..

# Rebuild
npm run ios
```

### Module not found errors

```bash
# Clear all and reinstall
rm -rf node_modules
npm install

# Clear watchman
watchman watch-del-all
```

### Socket connection issues

```bash
# Check API URL in .env
# Verify server is running
# Try using IP instead of localhost
```

### WebRTC not working

- Ensure permissions are granted
- Build development client, don't use Expo Go
- Check network firewall

### Expo Go limitations

Some features don't work on Expo Go:
- WebRTC
- Background tasks
- Custom native modules

**Solution**: Build development client

```bash
eas build --profile development --platform android
```

---

## 🤝 Contributing

### Contribution process

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Create a Pull Request

### Code Style

- Use **TypeScript** for type safety
- Follow **Prettier** configuration
- Adhere to **ESLint** rules
- Write tests for new features
- Comment complex code

### Git Commit Convention

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code, no logic changes
refactor: Refactor code
test: Add/update tests
chore: Update build, dependencies
```

---

## 📄 License

Private - All rights reserved

---

## 👥 Team

- **Developer**: Nguyễn Văn Minh
- **Email**: zolaracskh@gmail.com
- **GitHub**: [@NguyenNguyen0](https://github.com/NguyenNguyen0)

---

## 🙏 Acknowledgments

- [Expo Team](https://expo.dev/)
- [React Native Community](https://reactnative.dev/)
- [GluestackUI](https://gluestack.io/)
- All open-source contributors

---

## 📞 Support

If you encounter any issues or have questions:

1. Check [Troubleshooting](#-troubleshooting)
2. Search in [Issues](https://github.com/NguyenNguyen0/zolara/issues)
3. Create a new issue with:
   - Detailed problem description
   - Steps to reproduce
   - Environment info
   - Screenshots/logs if applicable

---

<div align="center">
  <p>Made with ❤️ by Zolara Team</p>
  <p>© 2025 Zolara. All rights reserved.</p>
</div>
