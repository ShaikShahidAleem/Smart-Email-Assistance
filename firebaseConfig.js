// Firebase configuration and helper functions for Gmail integration
window.firebaseConfig = {
  apiKey: "AIzaSyCUKtyfyIbdW6p4oDuckTEt3vpmNzIwcjw",
  authDomain: "smart-email-assistance-070.firebaseapp.com",
  projectId: "smart-email-assistance-070",
  storageBucket: "smart-email-assistance-070.firebasestorage.app",
  messagingSenderId: "594484064608",
  appId: "1:594484064608:web:e42789fed2d2f1cfe86e05",
  measurementId: "G-MYLLTQCPBT"
};

// Gmail API Configuration
window.GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose'
].join(' ');

// Auth state management
window.currentUser = null;
window.userToken = null;

// Initialize Firebase when script loads
function initializeFirebase() {
  // This will be called after Firebase SDK loads
  if (typeof firebase !== 'undefined') {
    const app = firebase.initializeApp(window.firebaseConfig);
    window.firebaseAuth = firebase.auth();
    window.firebaseDb = firebase.firestore();
    
    // Set up auth state listener
    window.firebaseAuth.onAuthStateChanged((user) => {
      window.currentUser = user;
      if (user) {
        // Get user token for Gmail API access
        user.getIdToken().then((idToken) => {
          window.userToken = idToken;
        });
      } else {
        window.userToken = null;
      }
    });
  }
}

// Auth helper functions
window.signInWithGoogle = async function() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
    provider.addScope('https://www.googleapis.com/auth/gmail.modify');
    provider.addScope('https://www.googleapis.com/auth/gmail.compose');
    provider.addScope('https://www.googleapis.com/auth/userinfo.email');
    provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
    
    // Try popup first, fallback to redirect if popup fails
    let result;
    try {
      result = await window.firebaseAuth.signInWithPopup(provider);
    } catch (popupError) {
      console.warn('Popup authentication failed, trying redirect:', popupError);
      
      // Fallback to redirect authentication
      await window.firebaseAuth.signInWithRedirect(provider);
      
      // For redirect, we need to wait for the redirect to complete
      // This will cause a page reload
      return new Promise((resolve) => {
        window.firebaseAuth.onAuthStateChanged((user) => {
          if (user) {
            resolve({ user });
          }
        });
      });
    }
    
    // Check if we have a valid result and user
    if (!result || !result.user) {
      throw new Error('Authentication failed - no user returned');
    }
    
    // For Gmail API through Firebase Auth, we use the Firebase ID token
    // The backend will handle the Gmail API calls using Firebase Admin SDK
    let firebaseIdToken = null;
    
    if (result.user) {
      try {
        // Get Firebase ID token for backend authentication
        firebaseIdToken = await result.user.getIdToken();
        console.log('Firebase ID token obtained:', firebaseIdToken ? 'Yes' : 'No');
      } catch (tokenError) {
        console.warn('Could not get Firebase ID token:', tokenError);
      }
    }
    
    // Store Firebase ID token for API calls
    if (firebaseIdToken) {
      localStorage.setItem('firebase_id_token', firebaseIdToken);
      console.log('Firebase ID token stored in localStorage');
    }
    
    // Get Google OAuth tokens from Firebase Auth result
    let googleAccessToken = null;
    if (result.credential && result.credential.accessToken) {
      googleAccessToken = result.credential.accessToken;
      console.log('Google OAuth token obtained:', googleAccessToken ? 'Yes' : 'No');
    }
    
    // Store user data in localStorage as fallback
    const userData = {
      email: result.user.email,
      displayName: result.user.displayName,
      uid: result.user.uid,
      lastLogin: new Date().toISOString()
    };
    
    // Store Google OAuth token for Gmail API (not Firebase ID token)
    if (googleAccessToken) {
      userData.accessToken = googleAccessToken;
      userData.refreshToken = result.credential && result.credential.refreshToken;
      // Also store in localStorage for easy access
      localStorage.setItem('gmail_access_token', googleAccessToken);
      if (result.credential && result.credential.refreshToken) {
        localStorage.setItem('gmail_refresh_token', result.credential.refreshToken);
      }
      console.log('Google OAuth tokens stored successfully');
    } else {
      // Fallback to Firebase ID token if Google token not available
      if (firebaseIdToken) {
        userData.accessToken = firebaseIdToken;
        localStorage.setItem('gmail_access_token', firebaseIdToken);
        console.log('Using Firebase ID token as fallback');
      }
    }
    
    // Store in Firestore (if available)
    if (window.firebaseDb) {
      try {
        await window.firebaseDb.collection('users').doc(result.user.uid).set(userData, { merge: true });
      } catch (dbError) {
        console.warn('Could not store user data in Firestore:', dbError);
      }
    }
    
    // Also store basic user info locally as backup
    localStorage.setItem('user_info', JSON.stringify(userData));
    
    return result;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

window.signOutUser = async function() {
  try {
    await window.firebaseAuth.signOut();
    window.currentUser = null;
    window.userToken = null;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFirebase);
} else {
  initializeFirebase();
}