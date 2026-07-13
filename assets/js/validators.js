/* ============================================================
   Validators & small UI helpers shared by auth forms.
   Kept dependency-free so every page can import just this.
   ============================================================ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export function isValidEmail(value) {
  return EMAIL_RE.test(String(value).trim());
}

export function isValidUsername(value) {
  return USERNAME_RE.test(String(value).trim());
}

/** Very small entropy-style scorer, 0–4, used to drive the strength meter. */
export function passwordStrength(value) {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  if (value.length < 6) score = Math.min(score, 1);
  return score;
}

export function isValidPassword(value) {
  return String(value).length >= 8;
}

/** Strip characters that have no business in a plain-text field, to
 *  reduce stored-XSS surface before data ever reaches Firestore. */
export function sanitizeText(value, maxLength = 500) {
  return String(value)
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function showAlert(el, message, type = "error") {
  if (!el) return;
  el.textContent = message;
  el.classList.remove("alert-error", "alert-success");
  el.classList.add(type === "error" ? "alert-error" : "alert-success", "show");
}

export function hideAlert(el) {
  if (!el) return;
  el.classList.remove("show");
}

export function setFieldError(fieldWrapperEl, message) {
  if (!fieldWrapperEl) return;
  fieldWrapperEl.classList.add("has-error");
  const errorEl = fieldWrapperEl.querySelector(".field-error");
  if (errorEl) errorEl.textContent = message;
}

export function clearFieldError(fieldWrapperEl) {
  if (!fieldWrapperEl) return;
  fieldWrapperEl.classList.remove("has-error");
}

export function setButtonLoading(buttonEl, isLoading) {
  if (!buttonEl) return;
  buttonEl.classList.toggle("is-loading", isLoading);
  buttonEl.disabled = isLoading;
}

/** Naive client-side rate limiter for form submissions — a real
 *  deployment should back this with Firestore/App Check too, but
 *  this stops accidental double-submits and rapid-fire retries. */
const lastSubmitAt = new Map();
export function isRateLimited(key, cooldownMs = 2000) {
  const now = Date.now();
  const last = lastSubmitAt.get(key) || 0;
  if (now - last < cooldownMs) return true;
  lastSubmitAt.set(key, now);
  return false;
}

/** Maps Firebase Auth error codes to plain-language, actionable copy. */
export function friendlyAuthError(error) {
  const code = error && error.code ? error.code : "";
  const map = {
    "auth/email-already-in-use": "An account already exists for that email. Try logging in instead.",
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/user-disabled": "This account has been disabled. Contact support if you think that's a mistake.",
    "auth/user-not-found": "No account matches that email.",
    "auth/wrong-password": "That password doesn't match this account.",
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/weak-password": "Choose a password with at least 8 characters.",
    "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
    "auth/popup-closed-by-user": "Google sign-in was closed before it finished.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
  };
  return map[code] || "Something went wrong. Please try again.";
}
