# Supabase Setup Guide for GutScore App

This guide will walk you through setting up Supabase authentication and database for the GutScore app, including Google Sign-In.

## Prerequisites

- A Supabase account ([supabase.com](https://supabase.com))
- A Google Cloud Console account ([console.cloud.google.com](https://console.cloud.google.com))
- Expo development environment set up

## Part 1: Create Supabase Project

### 1. Create a New Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Name**: GutScore (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** and wait for setup to complete (~2 minutes)

### 2. Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

3. Create a `.env.local` file in your project root:

```bash
# Copy from .env.example
cp .env.example .env.local
```

4. Update `.env.local` with your credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 3. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents from your existing SQL schema (you already have this set up!)
4. Click **"Run"** to execute the migration

This will create all necessary tables:
- `users` - User profiles
- `meals` - Meal logs with gut scores
- `symptoms` - Symptom tracking
- `triggers` - Food triggers
- `weekly_scores` - Weekly gut health metrics

## Part 2: Set Up Google OAuth

### 1. Create Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown → **"New Project"**
3. Name it **"GutScore"** and click **"Create"**
4. Select your new project from the dropdown

### 2. Configure OAuth Consent Screen

1. In the left menu, go to **APIs & Services** > **OAuth consent screen**
2. Select **"External"** and click **"Create"**
3. Fill in required fields:
   - **App name**: GutScore
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **"Save and Continue"**
5. Skip **Scopes** (click "Save and Continue")
6. Skip **Test users** (click "Save and Continue")
7. Click **"Back to Dashboard"**

### 3. Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. Select **"Web application"**
4. Name it **"GutScore Web Client"**
5. Add **Authorized JavaScript origins**:
   ```
   http://localhost:8081
   https://your-project.supabase.co
   ```
6. Add **Authorized redirect URIs**:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
7. Click **"Create"**
8. **Copy the Client ID** - you'll need this for your `.env.local` file

### 4. Enable Google Provider in Supabase

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Find **Google** and click to expand
3. Toggle **"Enable Sign in with Google"**
4. Paste your **Google Client ID** (from step 3.8)
5. Paste your **Google Client Secret** (from the same credentials page)
6. Click **"Save"**

### 5. Configure Redirect URLs in Supabase

1. In Supabase, go to **Authentication** > **URL Configuration**
2. Add the following **Redirect URLs**:
   ```
   gutscore://google-auth
   http://localhost:8081
   exp://your-expo-host.exp.direct
   ```
3. Click **"Save"**

## Part 3: Test Authentication

### 1. Build and Run the App

Since Google Sign-In requires native code (custom URL schemes), you need a development build:

```bash
# Install dependencies (if not already done)
npm install

# Build for iOS (requires macOS with Xcode)
npx expo run:ios

# Build for Android
npx expo run:android
```

### 2. Test Email/Password Sign-Up

1. Run the app
2. Go to the Sign-Up screen
3. Enter an email and password
4. Click **"Continue with Email"**
5. Check your email for a confirmation link (if email confirmation is enabled)

### 3. Test Google Sign-In

1. Run the app
2. Go to the Login or Sign-Up screen
3. Click **"Continue with Google"**
4. A browser window should open
5. Select your Google account
6. Grant permissions
7. You should be redirected back to the app and logged in

## Part 4: Troubleshooting

### Google Sign-In Not Working

**Error: "No OAuth URL returned from Supabase"**
- ✅ Check that Google provider is enabled in Supabase
- ✅ Verify Client ID and Secret are correctly entered
- ✅ Ensure redirect URIs match in both Google Cloud and Supabase

**Error: "redirect_uri_mismatch"**
- ✅ Add `https://your-project.supabase.co/auth/v1/callback` to Google Cloud authorized redirect URIs
- ✅ Make sure there are no trailing slashes or typos

**Browser doesn't redirect back to app**
- ✅ Ensure `gutscore://google-auth` is added to Supabase redirect URLs
- ✅ Check that your app.json has `"scheme": "gutscore"`
- ✅ Rebuild the app after changing app.json

### Database Errors

**Error: "permission denied for table users"**
- ✅ Run the SQL migration to set up Row Level Security (RLS) policies
- ✅ Check that the user is authenticated

**Error: "relation 'users' does not exist"**
- ✅ Run the database schema SQL in Supabase SQL Editor

### Development Build Issues

**Error: "Unable to resolve module"**
- ✅ Clear cache: `npx expo start --clear`
- ✅ Reinstall dependencies: `rm -rf node_modules && npm install`

**iOS build fails**
- ✅ Update CocoaPods: `cd ios && pod install`
- ✅ Clean derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`

## Part 5: Production Deployment

### 1. Update Environment Variables

For production, create `.env.production`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
```

### 2. Update OAuth Redirect URIs

Add your production domains to:

**Google Cloud Console:**
- Authorized JavaScript origins: `https://yourapp.com`
- Authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`

**Supabase:**
- Add your production deep link: `yourapp://google-auth`
- Add your production domain: `https://yourapp.com`

### 3. Build Production App

```bash
# Build for App Store/Play Store
eas build --platform ios --profile production
eas build --platform android --profile production
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Expo Google Authentication Guide](https://docs.expo.dev/guides/google-authentication/)
- [Supabase + Expo Guide](https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth)
- [Google OAuth Setup](https://console.cloud.google.com)

## Support

If you encounter issues:
1. Check the [Supabase Community](https://github.com/supabase/supabase/discussions)
2. Review [Expo Forums](https://forums.expo.dev/)
3. Check browser console and app logs for error messages
