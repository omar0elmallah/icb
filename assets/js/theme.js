/* ============================================================
   Theme — dark/light mode with localStorage persistence.
   applyStoredTheme() is also inlined in <head> on every page
   (see the snippet in each HTML file) so the correct theme is
   set before first paint and there's no flash of wrong theme.
   ============================================================ */

const STORAGE_KEY = "socialsphere-theme";

export function getStoredTheme() {
  return localStorage.getItem(STORAGE_KEY);
}

export function applyStoredTheme() {
  const stored = getStoredTheme();
  const preferred = stored || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  document.documentElement.setAttribute("data-theme", preferred);
  return preferred;
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  const next = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(STORAGE_KEY, next);
  return next;
}

export function initThemeToggle(buttonEl) {
  if (!buttonEl) return;
  applyStoredTheme();
  buttonEl.addEventListener("click", () => toggleTheme());
}
