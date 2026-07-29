/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ⚠️ IMPORTANT: Copy your ACTUAL config values from your existing firebase.ts
// (the one AdminLogin.tsx already imports `db` and `auth` from).
// Do NOT commit real API keys to public repos — use environment variables in production.
const firebaseConfig = {
  apiKey: "AIzaSyAQi4BK3fD8UecPDl4lY3SUUVFc99WOya8",
  authDomain: "civic-iq.firebaseapp.com",
  projectId: "civic-iq",
  storageBucket: "civic-iq.firebasestorage.app",
  messagingSenderId: "816058667104",
  appId: "1:816058667104:web:808b3581625e874644b305",
  measurementId: "G-217GEWCYRT"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);