/* ============================================================
   Firebase Configuration
   ------------------------------------------------------------
   Replace the placeholder values below with your own Firebase
   project's config (Firebase Console → Project Settings →
   General → Your apps → SDK setup and configuration).

   This file is imported by every page as an ES module, so it
   must stay valid on GitHub Pages with zero build step.

   SECURITY NOTE: Firebase web config values are not secret —
   they identify your project, they don't authorize access.
   Actual access control lives in your Firestore/Storage
   security rules (see /firestore.rules and /storage.rules).
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
