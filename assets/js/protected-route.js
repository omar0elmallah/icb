/* ============================================================
   Protected route guard.
   Import and call protectPage() at the top of any page that
   requires a signed-in user. It resolves with the Firebase user
   once confirmed, and redirects to login.html otherwise.

   Usage (inline module script in the page):
     import { protectPage } from "./assets/js/protected-route.js";
     const user = await protectPage();
     // ...render the page using `user`
   ============================================================ */

import { onAuthReady } from "./auth.js";

export function protectPage({ redirectTo = "login.html" } = {}) {
  return new Promise((resolve) => {
    const unsubscribe = onAuthReady((user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        const next = encodeURIComponent(window.location.pathname.split("/").pop());
        window.location.href = `${redirectTo}?next=${next}`;
      }
    });
  });
}

/** Opposite guard for auth pages themselves: if the user is
 *  already signed in, skip straight past login/signup. */
export function redirectIfAuthenticated({ redirectTo = "index.html" } = {}) {
  return new Promise((resolve) => {
    const unsubscribe = onAuthReady((user) => {
      unsubscribe();
      if (user) {
        window.location.href = redirectTo;
      } else {
        resolve(null);
      }
    });
  });
}
