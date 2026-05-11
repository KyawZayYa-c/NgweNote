// src/services/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// @ts-ignore
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let app: any;
let db: any;
let auth: any;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  
  // persistence ကို string အဖြစ် ပြောင်းသုံးခြင်းဖြင့် type error ကို ကျော်လွှားနိုင်ပါတယ်
  const persistence = (getReactNativePersistence as any)(ReactNativeAsyncStorage);
  
  auth = initializeAuth(app, {
    persistence: persistence
  });
} catch (error) {
  console.error('Firebase initialization failed:', error);
  try {
    auth = getAuth(app);
  } catch (e) {}
}

export { db, auth };
