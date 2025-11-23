# 🚀 Zolara Server - Backend API

![NestJS](https://img.shields.io/badge/NestJS-11.0.1-ea2845?logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178c6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.19.0-2d3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-dc382d?logo=redis)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8.1-010101?logo=socket.io)

A robust and scalable backend server for the Zolara social communication platform, built with NestJS and TypeScript. Features real-time messaging, voice/video call coordination, user management, and comprehensive admin APIs.

## 📖 Introduction

Zolara Server is the backbone of the Zolara platform, providing a comprehensive REST API and WebSocket services for real-time communication. Built with enterprise-grade architecture patterns, it supports millions of messages, handles concurrent connections efficiently, and provides robust authentication and authorization mechanisms.

The server implements a modular architecture with clear separation of concerns, making it maintainable, testable, and scalable. It leverages modern technologies like NestJS, Prisma ORM, Redis caching, and Socket.io for optimal performance.

### Architecture Highlights

- **Modular Design**: Feature-based module organization for maintainability
- **Real-time Communication**: WebSocket support with Socket.io for instant messaging
- **Caching Layer**: Redis integration for improved performance
- **Database ORM**: Prisma for type-safe database queries
- **Security First**: JWT authentication, password hashing, and secure file handling

## ✨ Features

### Core Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - OTP verification via email
  - Secure password hashing with bcrypt
  - Session management with Redis

- 💬 **Real-time Messaging**
  - Instant message delivery with Socket.io
  - One-on-one and group conversations
  - Message status tracking (sent, delivered, read)
  - Typing indicators and online presence
  - Message history and pagination

- 📞 **Voice & Video Calls**
  - Call signaling and coordination
  - Call history and duration tracking
  - Missed call notifications

- 👥 **User Management**
  - User profiles with avatars
  - Friend requests and contacts management
  - User search and discovery
  - Block and report functionality
  - Privacy settings

- 📊 **Admin Dashboard APIs**
  - User analytics and statistics
  - Message volume metrics
  - System health monitoring
  - User management and moderation
  - Activity logs

- 📁 **File Storage**
  - Image upload and processing with Sharp
  - Supabase Storage integration
  - Avatar and media management
  - Secure file access with signed URLs

- 🤖 **AI Integration**
  - Google Gemini AI for smart features
  - Content moderation assistance
  - Automated responses (optional)

### Technical Features

- **RESTful API**: Clean, versioned REST endpoints
- **WebSocket Gateway**: Real-time bidirectional communication
- **Database Migrations**: Version-controlled schema changes with Prisma
- **Caching**: Redis for session storage and performance optimization
- **Email Service**: Nodemailer with Gmail SMTP for notifications
- **Error Handling**: Comprehensive error handling and logging
- **Validation**: Request validation with class-validator
- **Testing**: Unit and E2E test setup with Jest

## 🛠️ Tech Stack

### Core Framework
- **NestJS** (11.0.1) - Progressive Node.js framework
- **TypeScript** (5.7.3) - Type-safe JavaScript
- **Node.js** (18+) - Runtime environment

### Database & ORM
- **PostgreSQL** (17) - Primary database
- **Prisma** (6.19.0) - Next-generation ORM
- **Redis** (7) - In-memory caching and session store

### Real-time & Communication
- **Socket.io** (4.8.1) - WebSocket library for real-time features
- **Nodemailer** (7.0.10) - Email sending
- **Resend** (6.4.2) - Modern email API
- **Twilio** (5.10.5) - SMS notifications (optional)

### Authentication & Security
- **Passport** (0.7.0) - Authentication middleware
- **JWT** (@nestjs/jwt 11.0.1) - JSON Web Tokens
- **bcrypt** (6.0.0) - Password hashing

### File Storage & Processing
- **Supabase** (2.81.1) - Cloud storage solution
- **Sharp** (0.34.5) - High-performance image processing
- **Multer** (2.0.0) - File upload handling

### AI & External Services
- **Google Generative AI** (0.24.1) - Gemini AI integration
- **Axios** (1.13.2) - HTTP client

### Development Tools
- **ESLint** (9.18.0) - Code linting
- **Prettier** (3.4.2) - Code formatting
- **Jest** (30.0.0) - Testing framework
- **Husky** (9.1.7) - Git hooks
- **Swagger** (@nestjs/swagger 11.2.1) - API documentation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **PostgreSQL** 17 ([Download](https://www.postgresql.org/download/))
- **Redis** 7 ([Download](https://redis.io/download))
- **Docker** (optional, for containerized setup) ([Download](https://www.docker.com/get-started))

### Optional Requirements

- Gmail account for email notifications
- Supabase account for file storage ([Sign up](https://supabase.com/))
- Google AI Studio API key for AI features ([Get API Key](https://makersuite.google.com/app/apikey))

## 🚀 Installation

### Option 1: Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/NguyenNguyen0/zolara.git
cd zolara/zolara-server
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=zolara_db
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Environment
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_DAYS=30

# OTP Configuration
OTP_EXPIRY_SECONDS=300

# Email Configuration (Gmail SMTP)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Storage Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Google Gemini API Key
GEMINI_API_KEY=your-gemini-api-key
```

#### 4. Start PostgreSQL and Redis

**Using Docker Compose (Recommended):**

```bash
docker-compose up -d postgres redis
```

**Or manually start your local PostgreSQL and Redis instances.**

#### 5. Run Database Migrations

```bash
npm run db:migrate
```

#### 6. Seed the Database (Optional)

```bash
npm run db:seed
```

This will create sample users and data for testing.

#### 7. Start the Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

#### 8. Access API Documentation

Open your browser and navigate to:
- Swagger UI: `http://localhost:3000/api/docs`
- API JSON: `http://localhost:3000/api/docs-json`

### Option 2: Docker Compose Setup

This option sets up the entire stack (API + PostgreSQL + Redis) with Docker.

#### 1. Clone and Configure

```bash
git clone https://github.com/NguyenNguyen0/zolara.git
cd zolara/zolara-server
cp .env.example .env
```

Edit the `.env` file with your credentials.

#### 2. Build and Start All Services

```bash
docker-compose up -d
```

This will:
- Build the API container
- Start PostgreSQL with health checks
- Start Redis with health checks
- Run database migrations automatically
- Start the API server on port 3000

#### 3. Check Service Status

```bash
docker-compose ps
```

#### 4. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
```

#### 5. Stop Services

```bash
docker-compose down
```

To remove volumes as well:

```bash
docker-compose down -v
```

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start with hot-reload
npm run start:dev        # Alternative dev command
npm run start:debug      # Start with debugging

# Production
npm run build            # Build the application
npm run start            # Start production server
npm run start:prod       # Start production (alternative)

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database with sample data
npm run db:setup         # Setup database (migrate only)

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier

```

## 🔧 Configuration

### Database Configuration

The server uses Prisma ORM. To modify the database schema:

1. Edit `prisma/schema.prisma`
2. Create a migration:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```
3. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

### Environment-Specific Configuration

The application supports multiple environments:

- **Development**: `NODE_ENV=development`
- **Production**: `NODE_ENV=production`
- **Testing**: `NODE_ENV=test`

### Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password: [Google Account Settings](https://myaccount.google.com/apppasswords)
3. Use the app password in `GMAIL_APP_PASSWORD`

### Supabase Storage Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API
3. Copy your project URL and service role key
4. Create storage buckets as needed

## 📚 API Documentation

Once the server is running, you can access:

- **Postman API**: `.\zolara-server\postman\Zolara API.postman_collection.json`

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start:prod
```

### Environment Variables for Production

Ensure all sensitive environment variables are properly configured:

```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
REDIS_HOST=your-production-redis-host
JWT_SECRET=strong-random-secret
# ... other production configs
```

### Docker Deployment

Build production image:

```bash
docker build -t zolara-server .
```

Run container:

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL=your-db-url \
  -e REDIS_HOST=your-redis-host \
  zolara-server
```

## 🤝 Contributing

We welcome contributions! Please see the main [repository README](../README.md) for contribution guidelines.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **Main Repository**: [Zolara](https://github.com/NguyenNguyen0/zolara)
- **Admin Dashboard**: [zolara-admin](../zolara-admin)
- **Mobile App**: [zolara-mobile](../zolara-mobile)

**Built with ❤️ by the Zolara Team**