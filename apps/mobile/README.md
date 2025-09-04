# Welcome to Zolara Mobile App 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Authentication Features

- User registration with email and password
- User login with email and password
- User logout
- Form validation
- Error handling
- State management using Redux
- Secure authentication with Firebase

## File Structure

- `/app` - Contains the main app screens
  - `index.tsx` - Home screen with conditional rendering based on auth state
  - `auth.tsx` - Login/Register screen with form handling
  - `_layout.tsx` - Root layout with Redux Provider
- `/src` - Source code
  - `/components` - Reusable UI components
  - `/config` - Configuration files
  - `/hooks` - Custom React hooks
  - `/services` - External service integrations
  - `/store` - Redux store configuration
  - `/utils` - Utility functions

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Make sure your Firebase configuration is set in the `.env` file:

   ```
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   FIREBASE_APP_ID=your_app_id
   ```

3. Start the app

   ```bash
   npm run dev:mobile #from ./zalora/
   ```
