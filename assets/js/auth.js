/* ============================================================
   Auth — wraps Firebase Authentication for every auth page.
   Each page's inline script imports the specific wireXxx()
   function it needs and hands it its own DOM elements.
   ============================================================ */

import { auth, db } from "../../firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  isValidEmail,
  isValidUsername,
  isValidPassword,
  sanitizeText,
  showAlert,
  hideAlert,
  setFieldError,
  clearFieldError,
  setButtonLoading,
  isRateLimited,
  friendlyAuthError,
} from "./validators.js";

const googleProvider = new GoogleAuthProvider();

/** Creates the /users/{uid} profile document on first sign-in,
 *  and leaves an existing profile untouched on subsequent ones. */
async function ensureUserDocument(user, extra = {}) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  const username =
    extra.username || (user.email ? user.email.split("@")[0] : `user_${user.uid.slice(0, 6)}`);

  await setDoc(ref, {
    uid: user.uid,
    displayName: extra.displayName || user.displayName || username,
    username: sanitizeText(username, 20),
    email: user.email || "",
    avatarUrl: user.photoURL || "",
    coverPhotoUrl: "",
    bio: "",
    website: "",
    country: "",
    verified: false,
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    joinedAt: serverTimestamp(),
  });
}

/* ---------------- Sign up ---------------- */

export function wireSignupForm({ form, alertEl, submitBtn, fields }) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert(alertEl);
    [fields.name, fields.username, fields.email, fields.password].forEach(clearFieldError);

    if (isRateLimited("signup")) {
      showAlert(alertEl, "Please wait a moment before trying again.");
      return;
    }

    const displayName = sanitizeText(fields.name.querySelector("input").value, 60);
    const username = fields.username.querySelector("input").value.trim();
    const email = fields.email.querySelector("input").value.trim();
    const password = fields.password.querySelector("input").value;
    const agreedToTerms = fields.terms ? fields.terms.checked : true;

    let hasError = false;
    if (displayName.length < 2) {
      setFieldError(fields.name, "Enter your name.");
      hasError = true;
    }
    if (!isValidUsername(username)) {
      setFieldError(fields.username, "3–20 characters: letters, numbers, underscores only.");
      hasError = true;
    }
    if (!isValidEmail(email)) {
      setFieldError(fields.email, "Enter a valid email address.");
      hasError = true;
    }
    if (!isValidPassword(password)) {
      setFieldError(fields.password, "Use at least 8 characters.");
      hasError = true;
    }
    if (!agreedToTerms) {
      showAlert(alertEl, "Accept the terms to create an account.");
      hasError = true;
    }
    if (hasError) return;

    setButtonLoading(submitBtn, true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      await ensureUserDocument(cred.user, { displayName, username });
      window.location.href = "index.html";
    } catch (error) {
      showAlert(alertEl, friendlyAuthError(error));
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

/* ---------------- Log in ---------------- */

export function wireLoginForm({ form, alertEl, submitBtn, fields, rememberMeCheckbox }) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert(alertEl);
    [fields.email, fields.password].forEach(clearFieldError);

    if (isRateLimited("login")) {
      showAlert(alertEl, "Please wait a moment before trying again.");
      return;
    }

    const email = fields.email.querySelector("input").value.trim();
    const password = fields.password.querySelector("input").value;

    let hasError = false;
    if (!isValidEmail(email)) {
      setFieldError(fields.email, "Enter a valid email address.");
      hasError = true;
    }
    if (!password) {
      setFieldError(fields.password, "Enter your password.");
      hasError = true;
    }
    if (hasError) return;

    setButtonLoading(submitBtn, true);
    try {
      const remember = rememberMeCheckbox ? rememberMeCheckbox.checked : true;
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await ensureUserDocument(cred.user);
      window.location.href = "index.html";
    } catch (error) {
      showAlert(alertEl, friendlyAuthError(error));
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

/* ---------------- Google sign-in (shared by login & signup) ---------------- */

export function wireGoogleButton({ button, alertEl, rememberMeCheckbox }) {
  if (!button) return;
  button.addEventListener("click", async () => {
    hideAlert(alertEl);
    setButtonLoading(button, true);
    try {
      const remember = rememberMeCheckbox ? rememberMeCheckbox.checked : true;
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      const cred = await signInWithPopup(auth, googleProvider);
      await ensureUserDocument(cred.user);
      window.location.href = "index.html";
    } catch (error) {
      showAlert(alertEl, friendlyAuthError(error));
    } finally {
      setButtonLoading(button, false);
    }
  });
}

/* ---------------- Forgot password ---------------- */

export function wireForgotPasswordForm({ form, alertEl, submitBtn, fields }) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert(alertEl);
    clearFieldError(fields.email);

    if (isRateLimited("forgot-password", 5000)) {
      showAlert(alertEl, "Please wait a moment before requesting another email.");
      return;
    }

    const email = fields.email.querySelector("input").value.trim();
    if (!isValidEmail(email)) {
      setFieldError(fields.email, "Enter a valid email address.");
      return;
    }

    setButtonLoading(submitBtn, true);
    try {
      await sendPasswordResetEmail(auth, email);
      showAlert(alertEl, "Check your inbox for a link to reset your password.", "success");
      form.reset();
    } catch (error) {
      // Deliberately vague: don't reveal whether an email is registered.
      showAlert(alertEl, "If that email has an account, a reset link is on its way.", "success");
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

/* ---------------- Logout ---------------- */

export async function logout() {
  await signOut(auth);
  window.location.href = "login.html";
}

/* ---------------- Session helper ---------------- */

export function onAuthReady(callback) {
  return onAuthStateChanged(auth, callback);
}
