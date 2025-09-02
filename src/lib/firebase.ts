// src/lib/firebase.ts

import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Firebase configuration - values pulled from .env.local
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;
let storage: ReturnType<typeof getStorage>;
let functions: ReturnType<typeof getFunctions>;

// Safely initialize Firebase services only on the client-side
if (typeof window !== "undefined") {
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app);
} else {
  // Provide mock instances or null objects for server-side build
  auth = {} as any;
  db = {} as any;
  storage = {} as any;
  functions = {} as any;
}

// Hardcoded list of admin emails (keep/edit as needed)
const adminEmails = [
  "mtatinen@gitam.edu",
  "nmenmula@gitam.edu",
  "adid@gitam.edu",
  "gelectra@gitam.edu",
  "webdevlopment0210@gmail.com",
  "premkumarjanumula@gmail.com",
];

export { app, db, auth, storage, functions, adminEmails };
