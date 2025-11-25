# Quick Setup Guide - Smart Email Assistant with Gmail Integration

## 🚀 Quick Start (5 Minutes)

Follow these steps to get Gmail integration working:

### Step 1: Install Dependencies
```bash
cd Projects/Smart Email Assistant
npm install
```

### Step 2: Firebase Setup (Required)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project or select existing
3. Enable Authentication → Google Sign-in
4. Enable Firestore Database
5. Download service account key:
   - Project Settings → Service Accounts
   - Generate new private key
   - Save as `serviceAccountKey.json` in this folder

### Step 3: Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select same project as Firebase
3. Enable Gmail API
4. Create OAuth 2.0 credentials (Web application)
5. Add redirect URI: `http://localhost:3001/auth/callback`

### Step 4: Environment Configuration
1. Copy `.env.example` to `.env`
2. Fill in your Google OAuth credentials:
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:3001/auth/callback
   PORT=3001
   ```

### Step 5: Start the Application
```bash
# Terminal 1: Start backend server
npm run dev

# Terminal 2: Serve frontend (or open index.html directly)
python -m http.server 8000
```

### Step 6: Use the Application
1. Open `http://localhost:8000`
2. Click "Sign In with Google"
3. Grant Gmail permissions
4. Enjoy real Gmail integration!

## 📁 File Structure
```
Smart Email Assistant/
├── index.html              # Frontend with Firebase Auth
├── firebaseConfig.js       # Firebase configuration
├── server.js               # Backend API with Gmail integration
├── package.json            # Dependencies and scripts
├── .env.example            # Environment variables template
├── serviceAccountKey.json  # Firebase service account (you create this)
└── README.md               # Full documentation
```

## ⚠️ Important Notes

### Security
- **Never commit `serviceAccountKey.json`** - it's in .gitignore
- **Keep your OAuth credentials secure** - don't share them
- **Use HTTPS in production** - required for OAuth redirects

### Firebase Configuration
- Enable Google Authentication in Firebase Console
- Add your domain to authorized domains in Firebase Auth settings
- Firestore will automatically create the `users` collection

### Gmail API Limits
- 1 billion quota units/day ( Gmail API quotas)
- Rate limits: 250 requests/user/100 seconds
- The app fetches 20 emails per request

## 🔧 Troubleshooting

**"Firebase not initialized"**
- Check that `serviceAccountKey.json` exists
- Verify Firebase project ID matches

**"Gmail API error"**
- Confirm Gmail API is enabled in Google Cloud Console
- Check OAuth consent screen is properly configured
- Verify redirect URIs match exactly

**"CORS errors"**
- Ensure backend is running on port 3001
- Check that frontend is making requests to correct endpoints

## 🎯 Testing the Integration

1. **Authentication Test:**
   - Click "Sign In with Google"
   - Should see your name in header
   - Sign out/in should work smoothly

2. **Gmail Data Test:**
   - After signing in, should fetch real emails
   - Process emails to see categorization
   - Generate drafts from real emails

3. **End-to-End Test:**
   - Sign in → Fetch emails → Process → Chat with agent → Create drafts

## 📞 Need Help?

1. Check browser console for errors
2. Verify all environment variables are set
3. Ensure both frontend and backend are running
4. Review the full README.md for detailed setup

---

**Ready to go!** You now have a fully functional Gmail-integrated email assistant with Firebase authentication.