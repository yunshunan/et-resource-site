// Firebase Configuration
// Replace these placeholder values with your actual Firebase project configuration
import { initializeApp } from '@firebase/app';
import { getAuth } from '@firebase/auth';

// Firebase configuration object
// You will need to replace these values with your actual Firebase project settings
// from the Firebase console (https://console.firebase.google.com)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
export default app;

// Usage instructions:
// 1. Create a Firebase project at https://console.firebase.google.com
// 2. Enable Authentication services in the Firebase console
// 3. Add your app's Firebase configuration values to your .env file
// 4. Import and use the exported auth object in your authentication service 