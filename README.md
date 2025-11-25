# Smart Email Assistant

A Gmail-integrated email productivity system that automatically categorizes emails, extracts action items, and generates draft replies using AI-powered prompts. Features Firebase Authentication and real Gmail account integration.

## 🚀 Features

### Core Functionality
- **📧 Gmail Integration** - Real Gmail account access with OAuth 2.0 authentication
- **🔐 Firebase Auth** - Secure user authentication and session management  
- **📬 Email Inbox Browser** - View and manage emails with sender, subject, timestamp, and categories
- **🏷️ Automatic Categorization** - AI-powered classification into Important, Newsletter, Spam, and To-Do
- **✅ Action Item Extraction** - Automatically identify tasks and deadlines from emails
- **💬 Agent Chat Interface** - Conversational AI assistant for inbox queries
- **✍️ Draft Generation** - Auto-generate professional email replies based on context
- **⚙️ Prompt Customization** - Full control over AI behavior through editable prompts

### Authentication & Security
- Google OAuth 2.0 integration via Firebase Auth
- Secure token storage in Firestore
- User-specific data isolation
- Automatic session management

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 14+ (for backend development)
- Firebase project with Authentication and Firestore enabled
- Google Cloud Console project with Gmail API enabled
- Modern web browser (Chrome, Firefox, Safari, Edge)

### 1. Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project or select existing one
   - Enable Authentication with Google provider
   - Enable Firestore Database

2. **Configure Authentication**
   - Go to Authentication > Sign-in method
   - Enable Google sign-in
   - Add your domain to authorized domains

3. **Setup Firestore**
   - Go to Firestore Database
   - Create database in production or test mode
   - No additional setup required - the app handles collections automatically

### 2. Google Cloud Console Setup

1. **Enable Gmail API**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Select your project (same as Firebase project)
   - Enable Gmail API
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized redirect URIs:
     - `http://localhost:3001/auth/callback` (for development)
     - `https://your-domain.com/auth/callback` (for production)

2. **Configure OAuth Consent Screen**
   - Set up OAuth consent screen
   - Add Gmail API scopes:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.modify`
     - `https://www.googleapis.com/auth/gmail.compose`

### 3. Application Setup

1. **Install Dependencies**
   ```bash
   cd Projects/Smart Email Assistant
   npm install
   ```

2. **Configure Environment Variables**
   
   Copy `.env.example` to `.env` and fill in your values:
   ```env
   # Firebase Admin SDK Configuration
   # Download serviceAccountKey.json from Firebase Console
   # Project Settings > Service Accounts > Generate Key
   
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:3001/auth/callback
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   ```

3. **Download Firebase Service Account**
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save as `serviceAccountKey.json` in project root
   - **Important**: Never commit this file to version control

### 4. Running the Application

1. **Start Backend Server**
   ```bash
   npm run dev
   ```

2. **Start Frontend**
   Open `index.html` in your browser, or serve it through a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```

3. **Access the Application**
   - Frontend: `http://localhost:8000` (or your local server address)
   - Backend API: `http://localhost:3001`

## 📖 Usage Guide

### 1. Authentication

1. **Sign In**
   - Click "Sign In with Google" button
   - Grant Gmail permissions when prompted
   - You'll see your name in the header when authenticated

2. **Access Gmail Data**
   - Once signed in, the app automatically fetches your Gmail inbox
   - Real emails replace the mock data
   - All features work with your actual emails

3. **Sign Out**
   - Click "Sign Out" to end your session
   - Data is cleared from the application

### 2. Email Management

**Email Processing:**
- Click "Process Emails" to categorize and extract action items
- Categories: Important, Newsletter, Spam, To-Do
- Action items appear with checkmarks and deadlines

**Email Viewing:**
- Click any email in the inbox to view full details
- See sender, timestamp, category, and action items
- Generate draft replies directly from the email view

### 3. AI Agent Chat

**Example Queries:**
- `"Show me all urgent emails"` - Lists Important category emails
- `"What tasks do I need to do?"` - Aggregates all action items
- `"Summarize this email"` - Provides summary (select email first)
- `"Draft a reply"` - Generates draft and saves to Drafts tab

### 4. Draft Management

**Create Drafts:**
- Auto-generated from selected emails
- Manual composition in Drafts tab
- Via agent chat commands

**Manage Drafts:**
- View all saved drafts with timestamps
- Edit draft content
- Delete unwanted drafts

### 5. Prompt Customization

**Customize AI Behavior:**
- Navigate to Prompts tab
- Edit categorization rules
- Modify action item extraction
- Adjust draft generation style

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Smart Email Assistant          │
├─────────────────────────────────────────┤
│  Frontend (React + HTML)               │
│  ├── Firebase Auth UI                  │
│  ├── Gmail Data Display                │
│  ├── Agent Chat Interface              │
│  ├── Draft Management                  │
│  └── Prompt Editor                     │
├─────────────────────────────────────────┤
│  Backend (Node.js + Express)           │
│  ├── Firebase Admin SDK                │
│  ├── Gmail API Integration             │
│  ├── OAuth Token Management            │
│  └── Firestore Database Operations     │
├─────────────────────────────────────────┤
│  External Services                     │
│  ├── Firebase Auth                     │
│  ├── Firestore Database                │
│  ├── Gmail API                         │
│  └── Google OAuth 2.0                  │
└─────────────────────────────────────────┘
```

### Key Components

**Frontend (`index.html`):**
- Firebase Authentication integration
- Gmail email fetching and display
- AI-powered email processing
- User interface with tabs and components

**Backend (`server.js`):**
- Express.js REST API
- Firebase Admin SDK integration
- Gmail API client setup
- OAuth token management
- Firestore database operations

**Database (Firestore):**
- User authentication data
- OAuth access tokens
- User preferences and settings

## 🔒 Security Features

### Authentication & Authorization
- OAuth 2.0 with Google via Firebase Auth
- Secure token storage in Firestore
- User-specific data isolation
- Automatic token refresh handling

### API Security
- Firebase ID token verification
- CORS protection
- Input validation and sanitization
- Error handling without sensitive data exposure

### Data Privacy
- User emails never stored permanently
- Tokens stored securely in Firestore
- Session-based data access
- No sensitive data logging

## 🛡️ Environment Configuration

### Development Environment
```env
NODE_ENV=development
PORT=3001
GOOGLE_CLIENT_ID=your_dev_client_id
GOOGLE_CLIENT_SECRET=your_dev_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/callback
```

### Production Environment
```env
NODE_ENV=production
PORT=3001
GOOGLE_CLIENT_ID=your_prod_client_id
GOOGLE_CLIENT_SECRET=your_prod_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.com/auth/callback
```

## 📋 API Endpoints

### Gmail Operations
- `POST /api/gmail/fetch` - Fetch user's Gmail inbox
- `POST /api/gmail/draft` - Create email draft in Gmail

### Authentication
- `POST /api/auth/store-tokens` - Store OAuth tokens after auth
- Firebase Auth handles all sign-in/sign-out operations

## 🚨 Troubleshooting

### Common Issues

**1. Authentication Failures**
- Verify Firebase Auth is enabled
- Check OAuth consent screen configuration
- Ensure redirect URIs match exactly

**2. Gmail API Errors**
- Confirm Gmail API is enabled in Google Cloud Console
- Check OAuth scopes include required Gmail permissions
- Verify client ID and secret are correct

**3. Firestore Connection Issues**
- Ensure Firestore database is created
- Check service account key is valid
- Verify Firebase project permissions

**4. CORS Errors**
- Ensure backend server is running on port 3001
- Check CORS configuration in server.js
- Verify frontend is making requests to correct endpoints

### Debug Steps

1. **Check Console Logs**
   ```bash
   # Backend logs
   npm run dev
   
   # Browser console
   # Check for JavaScript errors
   ```

2. **Verify Environment Variables**
   ```bash
   # Check .env file exists and is configured
   cat .env
   
   # Verify serviceAccountKey.json exists
   ls -la serviceAccountKey.json
   ```

3. **Test API Endpoints**
   ```bash
   # Test Gmail fetch endpoint
   curl -X POST http://localhost:3001/api/gmail/fetch \
     -H "Content-Type: application/json" \
     -d '{"idToken": "your_firebase_token"}'
   ```

## 📈 Future Enhancements

### Planned Features
- [ ] Email search and filtering
- [ ] Email threading and conversations  
- [ ] Attachment handling
- [ ] Rich text email composition
- [ ] Email templates library
- [ ] Smart inbox with priority sorting
- [ ] Email analytics and insights
- [ ] Multi-account support
- [ ] Mobile responsive improvements

### Technical Improvements
- [ ] Real-time email synchronization
- [ ] Offline capability
- [ ] Advanced AI processing with LLM integration
- [ ] Email encryption and security enhancements
- [ ] Performance optimization for large inboxes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For questions or issues:
- Check the troubleshooting section above
- Review Firebase and Gmail API documentation
- Examine console logs for specific error messages
- Ensure all environment variables are correctly configured

---

**Status:** ✅ Gmail Integration Complete  
**Version:** 2.0.0 with Firebase Auth  
**Last Updated:** November 25, 2025