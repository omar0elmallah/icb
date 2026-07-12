# SocialSphere

A social platform built as a static frontend (HTML5, CSS3, vanilla ES6 modules)
with Firebase as the backend, designed to run on GitHub Pages with zero build step.

## Phase 1 — what's in this build

- Design system: color tokens (dark + light), type scale, glassmorphism
  surfaces, buttons, floating-label inputs, skeleton loading, the orbit-mark
  brand signature.
- Auth pages: `login.html`, `signup.html`, `forgot-password.html`, wired to
  Firebase Authentication (email/password + Google).
- Session handling: "remember me" toggles between local and session
  persistence; `protected-route.js` guards private pages and bounces signed
  out users to `login.html`.
- `index.html`: a minimal protected landing page proving the guard, session,
  logout, and theme toggle all work end to end.
- `firestore.rules` / `storage.rules`: locked down by default, with the
  `users` collection and avatar/cover uploads scoped to their owner.

Later phases add the feed, profiles, messaging, notifications, stories,
search, explore, and the admin panel on top of this foundation.

## Project structure

```
SocialSphere/
├── assets/
│   ├── css/
│   │   ├── design-system.css   # tokens, base elements, dark/light mode
│   │   └── auth.css            # auth layout, aurora background, form styles
│   ├── js/
│   │   ├── auth.js             # signup/login/google/logout/reset
│   │   ├── validators.js       # form validation, sanitization, error copy
│   │   ├── theme.js            # dark/light toggle + persistence
│   │   └── protected-route.js  # route guard for private pages
│   ├── images/
│   └── icons/
├── index.html                  # protected placeholder home
├── login.html
├── signup.html
├── forgot-password.html
├── firebase-config.js          # your Firebase project keys go here
├── firestore.rules
├── storage.rules
├── README.md
└── LICENSE
```

## 1. Create a Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com) and
   create a new project.
2. **Build → Authentication → Get started.** Enable the **Email/Password**
   and **Google** sign-in providers.
3. **Build → Firestore Database → Create database.** Start in production
   mode (the rules in this repo lock everything down by default anyway).
4. **Build → Storage → Get started.**
5. In **Project settings → General → Your apps**, click the web icon
   (`</>`) to register a web app and copy the `firebaseConfig` object.

## 2. Configure the app

Open `firebase-config.js` at the project root and replace the placeholder
values with the config you copied:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

These values identify your Firebase project — they are not secret. Real
access control lives in `firestore.rules` and `storage.rules`.

## 3. Deploy the security rules

Using the [Firebase CLI](https://firebase.google.com/docs/cli):

```bash
npm install -g firebase-tools
firebase login
firebase init firestore storage   # point it at firestore.rules / storage.rules
firebase deploy --only firestore:rules,storage:rules
```

## 4. Run it locally

No build step is required — it's static HTML/CSS/JS. Serve the folder with
any static server, for example:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080/signup.html` to create an account.

> Opening the HTML files directly via `file://` will not work — ES modules
> and Firebase's popup-based Google sign-in both require an http(s) origin.

## 5. Deploy to GitHub Pages

1. Push this project to a GitHub repository.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`,
   pick your branch (e.g. `main`) and the `/ (root)` folder.
4. Save. GitHub will publish the site at
   `https://<your-username>.github.io/<repo-name>/`.
5. Back in the Firebase console, go to **Authentication → Settings →
   Authorized domains** and add your GitHub Pages domain
   (`<your-username>.github.io`) so Google sign-in works there too.

## Notes on security

- Inputs are sanitized client-side (`validators.js`) and Firestore writes
  are constrained server-side by `firestore.rules` — never rely on one
  without the other.
- Firebase Auth error codes are mapped to plain-language messages; the
  forgot-password flow intentionally never reveals whether an email is
  registered.
- A lightweight client-side cooldown prevents accidental double-submits.
  Production deployments should pair this with Firebase App Check and
  Firestore-side rate limiting.

## License

See `LICENSE`.
