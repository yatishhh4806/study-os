import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAFjDUZf2NuhbJPfvYD75FXJ5Rt7Z4EZCg",
  authDomain: "study-0s.firebaseapp.com",
  projectId: "study-0s",
  storageBucket: "study-0s.firebasestorage.app",
  messagingSenderId: "875319657278",
  appId: "1:875319657278:web:bdaf8b257b8e559833226f",
  measurementId: "G-XWF0HZ64S3",
};

const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);

// Providers
export const googleProvider =
  new GoogleAuthProvider();

export const githubProvider =
  new GithubAuthProvider();

export default app;