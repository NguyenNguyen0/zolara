# 🚀 Zolara Backend Server

The backend server for Zolara - a modern real-time chat application that provides comprehensive messaging, friendship management, and voice/video calling capabilities.

## 📖 About Zolara

Zolara is a full-stack chat application designed to deliver seamless real-time communication experiences. Built with modern technologies and scalable architecture, it supports text messaging, media sharing, voice/video calls, group chats, and advanced friendship management features.

### Key Features

- 💬 **Real-time Messaging**: Instant text, image, and media message delivery
- 👥 **Group & Peer Chats**: Support for both one-on-one and group conversations
- 🤝 **Friend Management**: Add friends, send invitations, block/unblock users
- 📞 **Voice & Video Calls**: High-quality audio/video communication via Agora
- 📎 **File Sharing**: Upload and share images and documents
- 🎯 **Message Reactions**: React to messages with emojis
- 📌 **Message Pinning**: Pin important messages in conversations
- ↩️ **Message Replies**: Reply to specific messages with context
- 👤 **User Mentions**: Mention users in group conversations
- 🔒 **Authentication**: Secure Firebase Authentication integration

## 🛠️ Tech Stack

### Core Framework
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **TypeScript** - Type-safe JavaScript development

### Database & Backend Services
- **Firebase Firestore** - NoSQL cloud database for real-time data
- **Firebase Admin SDK** - Server-side Firebase integration
- **Firebase Authentication** - User authentication and authorization
- **Firebase Storage** - File storage and media handling

### Real-time Communication
- **Agora SDK** - Voice and video calling infrastructure
- **Agora Access Token** - Secure token generation for calls

### Development & Testing
- **Jest** - JavaScript testing framework
- **Supertest** - HTTP testing library
- **TSX** - TypeScript execution and REPL
- **Cross-env** - Cross-platform environment variables

### API Documentation & Middleware
- **Swagger** - API documentation and testing interface
- **Morgan** - HTTP request logger middleware
- **CORS** - Cross-Origin Resource Sharing
- **Multer** - File upload handling middleware

### Utilities
- **Chalk** - Terminal styling and colors
- **UUID** - Unique identifier generation
- **Dotenv** - Environment variable management

## 🏗️ Project Structure

```
apps/server/
├── src/
│   ├── configs/           # Configuration files
│   │   ├── firebase.config.ts    # Firebase admin setup
│   │   └── swagger.config.ts     # API documentation config
│   ├── controllers/       # Route handlers and business logic
│   │   ├── agora.controller.ts   # Voice/video call tokens
│   │   ├── chat.controller.ts    # Chat management
│   │   ├── friend.controller.ts  # Friend relationships
│   │   ├── message.controller.ts # Message operations
│   │   └── user.controller.ts    # User profile management
│   ├── middlewares/       # Express middleware
│   │   ├── auth.middleware.ts    # Authentication validation
│   │   ├── logger.middleware.ts  # Request logging
│   │   └── upload.middleware.ts  # File upload handling
│   ├── routes/           # API route definitions
│   │   ├── agora.ts      # Agora token endpoints
│   │   ├── chat.ts       # Chat-related endpoints
│   │   ├── friend.ts     # Friend management endpoints
│   │   ├── message.ts    # Message operations endpoints
│   │   └── user.ts       # User management endpoints
│   ├── scripts/          # Utility scripts
│   │   └── get-token.ts  # Firebase token generation
│   ├── test/             # Test files and utilities
│   ├── types/            # TypeScript type definitions
│   └── index.ts          # Main application entry point
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v16.x or higher)
- **Yarn** (v1.x or higher)
- **Firebase Project** with Firestore and Authentication enabled
- **Agora Account** for voice/video calling features

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/NguyenNguyen0/zolara.git
   cd zolara
   ```

2. **Install dependencies** from the project root:
   ```bash
   yarn install
   ```

3. **Set up environment variables**:
   ```bash
   cd apps/server
   cp .env.example .env
   ```

   Edit the `.env` file with your configuration:
   ```bash
   PORT=3000
   NODE_ENV=development

   # Firebase Configuration
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_STORAGE_BUCKET=your-project.appspot.com

   # Firebase Emulators (for development)
   FIRESTORE_EMULATOR_HOST=localhost:8080
   FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
   FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199

   # Agora Configuration
   AGORA_APP_ID=your_agora_app_id
   AGORA_APP_CERTIFICATE=your_agora_app_certificate
   ```

4. **Firebase Setup**:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database and Authentication
   - Download the service account key and place it in your project
   - Update Firebase configuration in `src/configs/firebase.config.ts`

5. **Agora Setup**:
   - Create an account at [Agora.io](https://www.agora.io/)
   - Create a new project and get your App ID and App Certificate
   - Add these credentials to your `.env` file

### 🏃‍♂️ Running the Server

#### Development Mode
Start the server with hot-reload:
```bash
yarn workspace server run dev
```

#### Production Mode
Build and start the server:
```bash
yarn workspace server run build
yarn workspace server run start
```

The server will be available at:
- **API Server**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs

### 🧪 Testing

#### Run All Tests
```bash
yarn workspace server run test
```

#### Firebase Emulator Setup (for testing)
The project includes Firebase emulator configuration for local testing:
```bash
# Reset emulators before testing
yarn workspace server run reset-emulators
```

### 📚 API Documentation

The server provides comprehensive API documentation using Swagger UI. Once the server is running, visit:

**http://localhost:3000/api-docs**

### 📋 Available API Endpoints

#### Authentication & Users
- `POST /api/users` - Create user profile
- `GET /api/users/:id` - Get user profile
- `PUT /api/users` - Update user profile
- `POST /api/users/reset-password` - Reset password

#### Friend Management
- `GET /api/friends/me` - Get friend list
- `POST /api/friends/:userId` - Add friend
- `DELETE /api/friends/:userId` - Remove friend
- `POST /api/friends/invitations` - Send friend invitation
- `GET /api/friends/invitations` - Get pending invitations
- `PATCH /api/friends/invitations/:id/accept` - Accept invitation
- `PATCH /api/friends/invitations/:id/reject` - Reject invitation
- `POST /api/friends/blocks/:userId` - Block user
- `DELETE /api/friends/blocks/:userId` - Unblock user

#### Chat Management
- `GET /api/chats` - Get chat conversations
- `POST /api/chats/peer` - Create peer chat
- `POST /api/chats/groups` - Create group chat
- `GET /api/chats/peer/:id` - Get peer chat info
- `GET /api/chats/group/:id` - Get group chat info
- `POST /api/chats/groups/:id/members` - Add group members
- `DELETE /api/chats/groups/:id/members/:userId` - Remove group member

#### Message Operations
- `GET /api/messages/:chatId` - Get chat messages
- `POST /api/messages/:chatId` - Send message
- `POST /api/messages/:chatId/share` - Share message
- `PUT /api/messages/:chatId/:messageId/recall` - Recall message
- `POST /api/messages/:chatId/:messageId/reactions` - Add reaction
- `DELETE /api/messages/:chatId/:messageId/reactions` - Remove reaction
- `PUT /api/messages/:chatId/:messageId/pin` - Pin message
- `PUT /api/messages/:chatId/:messageId/unpin` - Unpin message

#### Voice & Video Calls
- `GET /api/agora/rtc-token` - Get RTC token for calls

### 🛠️ Development Scripts

```bash
# Start development server with hot-reload
yarn dev

# Build TypeScript to JavaScript
yarn build

# Start production server
yarn start

# Run tests
yarn test

# Generate Firebase auth token
yarn get-token

# Reset Firebase emulators
yarn reset-emulators
```

### 🔧 Configuration

#### Firebase Configuration
Update `src/configs/firebase.config.ts` with your Firebase project settings.

#### Swagger Configuration
API documentation settings can be modified in `src/configs/swagger.config.ts`.

### 🧪 Testing with Postman

The project includes a comprehensive Postman collection (`zolara-postman-collection.json`) with pre-configured requests for all API endpoints. Import this collection into Postman for easy API testing.

### 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 📄 License

This project is licensed under the MIT License.

### 👥 Team

- **Nguyễn Trung Nguyên** (Team Leader)
- **Nguyễn Văn Minh** (Full-stack Developer)

---

For more information about the complete Zolara project, visit the [main repository](https://github.com/NguyenNguyen0/zolara).
