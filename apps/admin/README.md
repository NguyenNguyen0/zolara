# Zolara Admin Dashboard

A React-based admin dashboard for managing the Zolara messaging application. This app has been migrated from Firebase/Agora to use axios for API calls with mock data for preview purposes.

## Features

- 🔐 Mock authentication system
- 📊 Dashboard with user, message, and call statistics
- 📱 Responsive design with Tailwind CSS
- 🎨 Modern UI components
- 🔄 Real-time data refresh capability
- 🚀 Mock data for preview and testing

## Technology Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Lucide React
- **UI Components**: Custom components with Radix UI

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Navigate to the admin directory:
   ```bash
   cd apps/admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

### Login Credentials (Mock Data)

- **Email**: `admin@zolara.com`
- **Password**: `admin123`

## Environment Configuration

The app uses the following environment variables:

```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Environment Configuration
VITE_NODE_ENV=development

# Development Settings
VITE_USE_MOCK_DATA=true
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Card, Input)
│   └── ProtectedRoute.tsx
├── contexts/           # React contexts
│   ├── AuthContext.tsx     # Authentication state management
│   └── DashboardContext.tsx # Dashboard data management
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   └── useDashboard.ts
├── lib/                # Utility functions
│   └── utils.ts
├── pages/              # Page components
│   ├── LoginPage.tsx
│   └── DashboardPage.tsx
└── services/           # API and data services
    ├── api.ts          # Axios configuration
    └── mockData.ts     # Mock data for preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Mock Data

The application currently uses mock data for preview purposes. The mock data includes:

### User Statistics
- Total users: Randomly generated
- Active users: Users with 'online' status
- New users today/this week: Based on creation dates

### Message Statistics
- Total messages: Collection of mock messages
- Messages today/this week: Filtered by date

### Call Statistics
- Active calls: Random number (1-10)
- Total calls: Random number (100-600)
- Average call duration: Random duration (5-15 minutes)
- Current session stats: Optional real-time call data

## Integration with Backend

When the backend API is ready, you can:

1. Update `VITE_API_BASE_URL` in `.env` to point to your backend
2. Set `VITE_USE_MOCK_DATA=false` to use real API calls
3. Update the API endpoints in `src/services/api.ts`

### Expected API Endpoints

The app expects the following API structure:

```
POST /api/auth/login       # Authentication
POST /api/auth/logout      # Logout
GET  /api/users/stats      # User statistics
GET  /api/messages/stats   # Message statistics
GET  /api/calls/stats      # Call statistics
```

## Authentication Flow

1. User enters credentials on login page
2. App sends POST request to `/api/auth/login`
3. On success, stores JWT token and user data
4. Protected routes check for valid token
5. Token is automatically added to API requests via interceptor

## Dashboard Features

### Overview Cards
- Total Users with active count
- New Users Today with weekly count
- Total Messages with daily count
- Active Calls with total count

### Detailed Statistics
- User Activity breakdown
- Communication stats (messages and calls)
- Real-time session statistics (when available)

### Real-time Updates
- Manual refresh button
- Automatic data refresh capability
- Loading states and error handling

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. The built files will be in the `dist/` directory

3. Deploy the `dist/` directory to your hosting service

## Notes

- This app is part of the Zolara monorepo
- Firebase and Agora dependencies have been completely removed
- All authentication and data fetching now uses axios with mock data
- The app is ready for backend integration when APIs are available
- Mock data provides realistic preview functionality

## Future Enhancements

- User management interface
- Message moderation tools
- Advanced analytics and reporting
- Real-time notifications
- System configuration panel
