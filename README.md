# 💬 Zolara

Zolara is a fullstack chat application that provides real-time messaging capabilities using Firebase and Agora. This project is designed to demonstrate a modern, scalable, and efficient chat application architecture.

## 🧑‍💻 Members

- Nguyễn Trung Nguyên (leader 🗿)
- Nguyễn Văn Minh (fullstack dev 🤩)

## 🌟 Features
- **Real-time Messaging**: Powered by Firebase for seamless communication.
- **Video and Voice Calls**: Integrated with Agora for high-quality audio and video calls.
- **Cross-Platform Support**: Built with React Native for mobile and web compatibility.

## 📁 Project Structure
The project is organized into the following main directories:
- `apps/admin`: Admin dashboard for managing the application.
- `apps/mobile`: Mobile application built with React Native.
- `apps/server`: Backend server for handling API requests and business logic.
- `packages/*`: Shared configurations and types for the monorepo.

## ⚙️ Setup Instructions

### 📦 Prerequisites
Ensure you have the following installed on your system:
- Node.js (>= 16.x)
- Yarn (>= 1.x)
- Expo CLI (for mobile development)

### ⬇️ Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/nguyennguyen0/zolara.git
   cd zolara
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Add environment variables:
   - Create a `.env` file in the `apps/mobile` directory and add your Firebase and Agora credentials.

### 👟 Running the Applications

#### Mobile App
1. Start the development server:
   ```bash
   npm run dev:mobile
   ```

#### Admin Dashboard
1. Start the development server:
   ```bash
   npm run dev:admin
   ```

#### Backend Server
1. Start the server:
   ```bash
   npm run dev:server
   ```

### 🚚 Adding Dependencies to a Workspace
To add a dependency to a specific workspace, use the following command:
```bash
yarn workspace <workspace-name> add <dependency-name>
```
For example, to add `dotenv` to the `mobile` workspace:
```bash
yarn workspace mobile add dotenv
```
