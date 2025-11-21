# 🌟 Zolara - Real-time Social Communication Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-61dafb?logo=react)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61dafb?logo=react)
![NestJS](https://img.shields.io/badge/NestJS-11.0.1-ea2845?logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.19.0-2d3748?logo=prisma)

A comprehensive full-stack social communication platform featuring real-time messaging, voice/video calls, user management, and analytics dashboard. Built with modern technologies and designed for scalability and performance.

## 🧑‍💻 Team Members

| Name | Role | GitHub |
|------|------|--------|
| **Nguyễn Trung Nguyên** | Team Leader 🗿 | [@NguyenNguyen0](https://github.com/NguyenNguyen0) |
| **Nguyễn Văn Minh** | Fullstack Developer 🤩 | [@nvminh162](https://github.com/nvminh162) |

## 📖 Introduction

Zolara is a modern, real-time social communication platform that enables users to connect, chat, make voice/video calls, and share content seamlessly. The platform consists of three main components:

- **🖥️ Admin Dashboard**: A comprehensive web-based admin panel for monitoring and managing the platform
- **📱 Mobile App**: A cross-platform mobile application built with React Native and Expo
- **🚀 Backend Server**: A robust NestJS-based API server with real-time capabilities

### Key Features

- 💬 **Real-time Messaging**: Instant messaging with Socket.io
- 📞 **Voice & Video Calls**: High-quality communication features
- 👥 **User Management**: Complete user profiles and friend system
- 🔐 **Authentication & Security**: JWT-based secure authentication
- 📊 **Analytics Dashboard**: Comprehensive admin analytics and monitoring
- 🌐 **Cross-platform**: Web admin panel and mobile app
- 🔄 **Real-time Updates**: Live notifications and updates across all platforms

## 🛠️ Tech Stack

### Frontend Technologies

#### Admin Dashboard
- **Framework**: React 19.2.0 with TypeScript
- **Styling**: Tailwind CSS 4.1.17
- **Build Tool**: Vite 7.2.2
- **Routing**: React Router DOM 7.9.6
- **Charts**: Chart.js 4.5.1 with react-chartjs-2
- **Icons**: Lucide React, Radix UI Icons
- **HTTP Client**: Axios 1.13.2

#### Mobile App
- **Framework**: React Native 0.81.5 with Expo ~54.0
- **Navigation**: React Navigation 7.x
- **Styling**: NativeWind (Tailwind for React Native)
- **State Management**: Zustand & Redux Toolkit
- **Internationalization**: i18next & react-i18next
- **Real-time**: Socket.io Client
- **Storage**: AsyncStorage & Expo SecureStore

### Backend Technologies

- **Framework**: NestJS 11.0.1 with TypeScript
- **Database**: PostgreSQL with Prisma ORM 6.19.0
- **Caching**: Redis 5.9.0
- **Real-time**: Socket.io 4.8.1
- **Authentication**: JWT with Passport
- **File Storage**: Supabase Storage
- **Email**: Nodemailer & Resend
- **SMS**: Twilio
- **API Documentation**: Swagger/OpenAPI

### DevOps & Deployment

- **Containerization**: Docker & Docker Compose
- **Cloud Platforms**: Railway, Supabase
- **Database**: PostgreSQL (Production), Redis (Caching)
- **File Storage**: Supabase Storage
- **Environment Management**: Environment-specific configurations

## 📁 Project Structure

```
zolara/
├── zolara-admin/          # Admin Dashboard (React + TypeScript)
│   ├── src/
│   │   ├── components/    # UI Components
│   │   ├── contexts/      # React Contexts
│   │   ├── hooks/         # Custom Hooks
│   │   ├── pages/         # Page Components
│   │   ├── services/      # API Services
│   │   └── types/         # TypeScript Types
│   ├── Dockerfile         # Docker configuration
│   └── README.md          # Admin documentation
│
├── zolara-mobile/         # Mobile App (React Native + Expo)
│   ├── app/               # Expo Router pages
│   ├── src/
│   │   ├── components/    # Reusable Components
│   │   ├── hooks/         # Custom Hooks
│   │   ├── services/      # API Services
│   │   ├── store/         # State Management
│   │   └── types/         # TypeScript Types
│   └── README.md          # Mobile documentation
│
├── zolara-server/         # Backend API (NestJS)
│   ├── src/
│   │   ├── auth/          # Authentication Module
│   │   ├── user/          # User Management
│   │   ├── message/       # Messaging System
│   │   ├── dashboard/     # Admin Dashboard APIs
│   │   └── prisma/        # Database Module
│   ├── prisma/            # Database Schema & Migrations
│   ├── docker-compose.yml # Development services
│   ├── Dockerfile         # Production container
│   └── README.md          # Server documentation
│
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Docker** and **Docker Compose**
- **PostgreSQL** (for production)
- **Redis** (for caching)

### Quick Start (Development)

1. **Clone the repository:**
```bash
git clone https://github.com/NguyenNguyen0/zolara.git
cd zolara
```

2. **Set up the backend server:**
```bash
cd zolara-server
```
📖 **[Follow detailed server setup instructions →](./zolara-server/README.md)**

3. **Set up the admin dashboard:**
```bash
cd ../zolara-admin
```
📖 **[Follow detailed admin setup instructions →](./zolara-admin/README.md)**

4. **Set up the mobile app:**
```bash
cd ../zolara-mobile
```
📖 **[Follow detailed mobile setup instructions →](./zolara-mobile/README.md)**

### 🐳 Docker Development Setup

For a complete development environment with all services:

1. **Start backend services:**
```bash
cd zolara-server
docker-compose up -d postgres redis
```

2. **Set up database:**
```bash
npx prisma migrate deploy
npm run db:seed
```

3. **Start all services:**
```bash
# Terminal 1: Backend Server
cd zolara-server
npm run dev

# Terminal 2: Admin Dashboard  
cd zolara-admin
npm run dev

# Terminal 3: Mobile App
cd zolara-mobile
npm start
```

## 📚 Documentation

Each component has its own detailed documentation:

| Component | Description | Documentation |
|-----------|-------------|---------------|
| **🚀 Backend Server** | NestJS API with real-time features | [Server README](./zolara-server/README.md) |
| **🖥️ Admin Dashboard** | React-based admin panel | [Admin README](./zolara-admin/README.md) |
| **📱 Mobile App** | React Native mobile application | [Mobile README](./zolara-mobile/README.md) |

## 🌐 Deployment

### Production Deployment

The platform supports various deployment options:

- **Backend**: Railway, Heroku, or any Node.js hosting
- **Admin Dashboard**: Vercel, Netlify, or static hosting
- **Mobile App**: Expo EAS Build for iOS/Android stores
- **Database**: Railway PostgreSQL, Supabase, or managed PostgreSQL
- **Storage**: Supabase Storage, AWS S3, or similar

### Environment Variables

Each component requires specific environment variables. Check individual README files for detailed configuration:

- [Server Environment Variables](./zolara-server/README.md)
- [Admin Environment Variables](./zolara-admin/README.md) 
- [Mobile Environment Variables](./zolara-mobile/README.md)

## 🧪 Testing

Run tests across all components:

```bash
# Backend tests
cd zolara-server
npm run test
npm run test:e2e

# Admin tests (if configured)
cd zolara-admin
npm run test

# Mobile tests (if configured)
cd zolara-mobile
npm run test
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the code style and conventions
4. Add tests for new features
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Workflow

1. **Code Style**: Follow ESLint and Prettier configurations
2. **Commits**: Use conventional commit messages
3. **Testing**: Add tests for new features and bug fixes
4. **Documentation**: Update relevant README files

## 📄 License

This project is licensed under the MIT License. See individual component licenses for more details.

## 🔗 Links & Resources

- **Repository**: [GitHub - NguyenNguyen0/zolara](https://github.com/NguyenNguyen0/zolara)
- **Issues**: [GitHub Issues](https://github.com/NguyenNguyen0/zolara/issues)
- **Discussions**: [GitHub Discussions](https://github.com/NguyenNguyen0/zolara/discussions)

## 📞 Support

For support and questions:

- 📧 **Email**: Contact team members via GitHub
- 🐛 **Bug Reports**: [Create an issue](https://github.com/NguyenNguyen0/zolara/issues/new)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/NguyenNguyen0/zolara/discussions)

## 🎯 Roadmap

### Current Features ✅
- Real-time messaging system
- User authentication and profiles
- Admin dashboard with analytics
- Mobile app with cross-platform support
- Voice and video calling capabilities

### Upcoming Features 🚧
- Enhanced file sharing and media support
- Advanced user roles and permissions
- Push notifications for mobile
- Advanced analytics and reporting
- Multi-language support expansion

---

**Built with ❤️ by the Zolara Team**

*Empowering real-time communication through modern technology*
