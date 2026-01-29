# Firebase Setup Instructions

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter your project name (e.g., "AccuracyLab")
4. Click "Continue" and follow the setup wizard
5. Choose whether to enable Google Analytics (optional)
6. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **web icon** (`</>`) to add a web app
2. Register your app with a nickname (e.g., "AccuracyLab Web")
3. You don't need to set up Firebase Hosting (unless you want to)
4. Click "Register app"
5. Copy the Firebase configuration object

## Step 3: Update Firebase Configuration

1. Open `src/firebase/config.ts` in your project
2. Replace the placeholder values with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

## Step 4: Enable Google Authentication

1. In Firebase Console, go to **Authentication** from the left sidebar
2. Click on "Get started" if you haven't enabled Authentication yet
3. Go to the **Sign-in method** tab
4. Click on **Google** from the providers list
5. Toggle the "Enable" switch
6. Select a support email from the dropdown
7. Click "Save"

## Step 5: Configure Authorized Domains (Optional)

1. Still in the Authentication section, go to **Settings** > **Authorized domains**
2. Add your development domain (e.g., `localhost`)
3. Add your production domain when you deploy

## Step 6: Test Your Setup

1. Start your development server: `npm run dev`
2. Navigate to the Signup page
3. Click "Continue with Google"
4. Sign in with your Google account
5. Check the Firebase Console > Authentication > Users to verify the user was created

## Additional Configuration (Optional)

### Email/Password Sign-In

1. Go to Authentication > Sign-in method
2. Enable "Email/Password" provider
3. Save changes

### Firestore Database (for storing user data)

1. Go to Firestore Database from the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location
5. Click "Enable"

### Security Rules

Remember to update your Firebase security rules before going to production!

For Firestore:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

For Authentication, you can configure password requirements and other settings in the Authentication section.

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- Make sure your domain is added to the Authorized domains list in Firebase Console

### "Firebase: Error (auth/api-key-not-valid)"
- Double-check that you copied the API key correctly from Firebase Console

### "Firebase: Error (auth/configuration-not-found)"
- Ensure you've properly enabled Google Sign-in in the Firebase Console

## Environment Variables (Recommended for Production)

Instead of hardcoding your Firebase config, consider using environment variables:

1. Create a `.env` file in your project root
2. Add your Firebase config:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

3. Update `src/firebase/config.ts` to use environment variables:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}
```

4. Add `.env` to your `.gitignore` file
