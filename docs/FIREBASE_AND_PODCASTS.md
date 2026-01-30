# Firebase & Podcast Database Setup

## 1. Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project (or use existing).
2. Enable **Authentication** → **Sign-in method** → **Google** (enable and save).
3. Create a **Web app** in Project settings to get the config (apiKey, authDomain, projectId, etc.).
4. Add the same config to `.env` as `EXPO_PUBLIC_FIREBASE_*` (see `.env.example`).

## 2. Google OAuth (for “Continue with Google”)

1. In Firebase Console → **Authentication** → **Sign-in method** → **Google** → note the **Web client ID** (or use the one from the Web SDK config).
2. In [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials** → your OAuth 2.0 Client ID (Web):
   - Add **Authorized redirect URIs**:
     - For Expo Go: `https://auth.expo.io/@YOUR_EXPO_USERNAME/IELTSApp`
     - For dev: your app scheme, e.g. `ieltsapp://redirect` (from `npx expo start` or `app.json` scheme).
3. Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `.env` to that Web client ID.

## 3. Firestore rules (minimum for this app)

In Firebase Console → **Firestore Database** → **Rules**, use something like:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /progress/{date} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    match /podcasts/{podcastId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

(Adjust `allow write` for podcasts if you want to manage them from the app or an admin tool.)

## 4. Podcast lessons in Firestore

Podcasts are stored in a **`podcasts`** collection. Each document should have:

- `title` (string)
- `description` (string)
- `duration` (string, e.g. `"5:00"`)
- `audioUrl` (string, public URL to the audio file)
- `order` (number, for ordering)

**Add podcasts manually:**

1. Firestore → **Start collection** → Collection ID: `podcasts`.
2. Add documents (auto-ID or your own ID). Example:

| Field       | Type   | Value                                              |
|------------|--------|----------------------------------------------------|
| title      | string | IELTS Daily: Academic Vocabulary                    |
| description| string | Learn 5 essential academic words...                |
| duration   | string | 5:00                                               |
| audioUrl   | string | https://example.com/your-audio.mp3                  |
| order      | number | 0                                                  |

3. Add more documents for more daily lessons; the app picks one per day by `order` (and cycles by day index if you have multiple).

If the **`podcasts`** collection is empty, the app falls back to a built-in placeholder lesson and sample audio URL.
