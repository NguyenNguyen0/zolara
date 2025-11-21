# 🎯 Zolara Admin Dashboard

A modern, responsive admin dashboard for managing the Zolara social platform. Built with React 19, TypeScript, and Tailwind CSS, this dashboard provides comprehensive analytics and management tools for monitoring users, messages, and calls.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.2.2-646cff?logo=vite)

## ✨ Features

### 📊 Dashboard Overview
- **Real-time Statistics**: Monitor total users, active users, messages, and calls
- **Live Updates**: Automatic refresh of dashboard metrics
- **User Activity Tracking**: View new user registrations by day and week
- **Communication Metrics**: Track messaging and calling statistics

### 📈 Analytics & Trends
- **User Growth Chart**: Visualize user registration trends over time
- **Message Activity Chart**: Monitor messaging patterns and volumes
- **Call Distribution Chart**: Analyze call statistics and patterns
- **Performance Metrics**: Track system performance indicators
- **Interactive Charts**: Built with Chart.js for dynamic data visualization

### 🔐 Authentication & Security
- **Secure Login**: JWT-based authentication system
- **Protected Routes**: Role-based access control
- **Session Management**: Automatic token refresh
- **Logout Functionality**: Secure session termination

### 🎨 User Interface
- **Modern Design**: Clean and intuitive interface with gradient accents
- **Responsive Layout**: Fully responsive design for all screen sizes
- **Sidebar Navigation**: Collapsible sidebar for better space utilization
- **Dark/Light Themes**: Beautiful color schemes with Tailwind CSS
- **Loading States**: Smooth loading indicators for better UX
- **Icon System**: Lucide React icons for consistent visuals

### 📱 Responsive Design
- Mobile-first approach
- Tablet and desktop optimized layouts
- Adaptive navigation and content display

## 🚀 Tech Stack

### Core Framework
- **[React 19.2.0](https://react.dev/)** - Latest React with concurrent features
- **[TypeScript 5.9.3](https://www.typescriptlang.org/)** - Type-safe development
- **[Vite 7.2.2](https://vitejs.dev/)** - Lightning-fast build tool and dev server

### UI & Styling
- **[Tailwind CSS 4.1.17](https://tailwindcss.com/)** - Utility-first CSS framework
- **[@tailwindcss/vite](https://www.npmjs.com/package/@tailwindcss/vite)** - Tailwind CSS Vite plugin
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[Radix UI Icons](https://www.radix-ui.com/icons)** - Accessible icon components
- **[class-variance-authority](https://cva.style/docs)** - Component variant management
- **[clsx](https://github.com/lukeed/clsx)** - Conditional className utility
- **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Merge Tailwind classes

### Data Visualization
- **[Chart.js 4.5.1](https://www.chartjs.org/)** - Flexible charting library
- **[react-chartjs-2](https://react-chartjs-2.js.org/)** - React wrapper for Chart.js

### Routing & State
- **[React Router DOM 7.9.6](https://reactrouter.com/)** - Client-side routing
- **Context API** - Global state management for auth and dashboard data

### HTTP & API
- **[Axios 1.13.2](https://axios-http.com/)** - Promise-based HTTP client
- **API Interceptors** - Automatic token management and error handling

### Development Tools
- **[ESLint 9](https://eslint.org/)** - Code linting and quality
- **[TypeScript ESLint](https://typescript-eslint.io/)** - TypeScript-specific linting
- **[Vite Plugin React](https://github.com/vitejs/vite-plugin-react)** - Fast refresh support

## 📁 Project Structure

```
zolara-admin/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Card, Charts, etc.)
│   │   ├── AnalyticsSection.tsx
│   │   ├── DashboardHeader.tsx
│   │   ├── DashboardSidebar.tsx
│   │   └── OverviewSection.tsx
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── AuthContext.context.ts
│   │   └── AuthContext.types.ts
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useDashboard.ts
│   ├── lib/                # Utility functions
│   │   └── utils.ts
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx
│   │   └── Login.tsx
│   ├── services/           # API services
│   │   └── api.ts
│   ├── types/              # TypeScript type definitions
│   │   └── auth.types.ts
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── eslint.config.js        # ESLint configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── package.json            # Project dependencies
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/NguyenNguyen0/zolara.git
cd zolara/zolara-admin
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 🐳 Docker & Deployment

### Docker Build & Run

The application supports runtime environment variable configuration for Docker deployments:

1. **Build the Docker image:**
```bash
docker build -t zolara-admin .
```

2. **Run with custom API URL:**
```bash
docker run -p 8080:80 -e VITE_API_BASE_URL=https://api.yourserver.com/api/v1 zolara-admin
```

3. **Using docker-compose:**
```yaml
version: '3.8'
services:
  admin:
    build: .
    ports:
      - "8080:80"
    environment:
      - VITE_API_BASE_URL=https://api.yourserver.com/api/v1
      - PORT=80
```

### Railway Deployment

The project is configured for Railway deployment with automatic environment variable injection:

1. **Connect your GitHub repository to Railway**

2. **Set environment variables in Railway dashboard:**
   - `VITE_API_BASE_URL` - Your API backend URL (e.g., `https://api.yourapp.com/api/v1`)
   - `PORT` - Will be automatically set by Railway

3. **Deploy:**
   Railway will automatically detect the `Dockerfile` and build your application.

### How Runtime Configuration Works

The application uses a runtime configuration injection system:

- **Development**: Uses `.env` file with Vite's `import.meta.env`
- **Production (Docker/Railway)**: 
  1. Environment variables are injected at container startup
  2. `docker-entrypoint.sh` generates `env-config.js` with runtime values
  3. Application reads from `window._env_` object
  4. Falls back to build-time values if runtime config is unavailable

This approach allows you to:
- Use the same Docker image across different environments
- Change API URL without rebuilding
- Deploy to Railway with environment-specific configuration

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Optional: Other configuration
VITE_APP_NAME=Zolara Admin
```

### Tailwind Configuration

The project uses Tailwind CSS 4 with custom color schemes. See `tailwind.config.js` for customization options.

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

## 🔐 Authentication

The dashboard uses JWT-based authentication. Users must log in with valid credentials to access the dashboard features.

### Login Flow:
1. User enters email/phone and password
2. Credentials sent to backend API
3. JWT token received and stored in localStorage
4. Protected routes accessible with valid token
5. Auto-redirect to login on token expiration

## 📊 Dashboard Features

### Overview Section
- Total registered users
- Currently active users
- New user registrations (daily/weekly)
- Total messages sent
- Message statistics (today/this week)
- Active calls monitoring
- Total calls and average duration

### Analytics Section
- User growth trends with interactive charts
- Message activity patterns
- Call distribution analysis
- Performance metrics visualization
- Real-time session statistics

## 🎨 UI Components

The dashboard includes reusable UI components:
- **Card**: Container component with header and content
- **Charts**: Various chart types using Chart.js
- **Sidebar**: Collapsible navigation sidebar
- **Header**: Dashboard header with user info and logout

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the Zolara platform.

## 👥 Authors

- **NguyenNguyen0** - [GitHub Profile](https://github.com/NguyenNguyen0)

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Chart.js for beautiful data visualizations
- Lucide for the icon library
- The open-source community

---

Built with ❤️ using React, TypeScript, and Tailwind CSS
