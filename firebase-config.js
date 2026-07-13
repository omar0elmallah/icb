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
  apiKey: "AIzaSyAQbXmDrwZA96xQGeVOJFyPytoTYH1oYjY",
  authDomain: "gen-lang-client-0711136622.firebaseapp.com",
  projectId: "gen-lang-client-0711136622",
  storageBucket: "gen-lang-client-0711136622.firebasestorage.app",
  messagingSenderId: "1086342223086",
  appId: "1:1086342223086:web:9ec9301684f84cb7370fff"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
