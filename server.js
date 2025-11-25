// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
// Download service account key from Firebase Console
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('Failed to load serviceAccountKey.json:', error);
  console.log('Please download the service account key from Firebase Console');
  process.exit(1);
}

// Initialize Google Gemini AI
let genAI = null;
try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('Google Gemini AI initialized successfully');
} catch (error) {
  console.error('Failed to initialize Gemini AI:', error);
}

// Gmail API helper function
async function getGmailClient(idToken) {
  // Verify Firebase ID token
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  const uid = decodedToken.uid;
  
  // Get user's OAuth tokens from Firestore database
  const userTokens = await getUserTokensFromDB(uid);
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/callback'
  );
  
  oauth2Client.setCredentials({
    access_token: userTokens.accessToken,
    refresh_token: userTokens.refreshToken
  });
  
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

// Fetch emails from Gmail
app.post('/api/gmail/fetch', async (req, res) => {
  try {
    const { idToken, maxResults = 20 } = req.body;
    
    const gmail = await getGmailClient(idToken);
    
    // Get list of messages
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: maxResults,
      q: 'in:inbox' // You can customize the query
    });
    
    const messages = response.data.messages || [];
    
    // Fetch full details for each message
    const emailPromises = messages.map(msg => 
      gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full'
      })
    );
    
    const fullMessages = await Promise.all(emailPromises);
    
    // Parse emails into our format
    const parsedEmails = fullMessages.map((msg, idx) => {
      const headers = msg.data.payload.headers;
      const getHeader = (name) => headers.find(h => h.name === name)?.value || '';
      
      let body = '';
      if (msg.data.payload.parts) {
        const textPart = msg.data.payload.parts.find(p => p.mimeType === 'text/plain');
        if (textPart && textPart.body.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      } else if (msg.data.payload.body.data) {
        body = Buffer.from(msg.data.payload.body.data, 'base64').toString('utf-8');
      }
      
      return {
        id: msg.data.id,
        threadId: msg.data.threadId,
        sender: getHeader('From'),
        subject: getHeader('Subject'),
        timestamp: new Date(parseInt(msg.data.internalDate)).toISOString(),
        body: body.substring(0, 500), // Limit body length
        category: null,
        actionItems: [],
        gmailId: msg.data.id
      };
    });
    
    res.json({ emails: parsedEmails });
  } catch (error) {
    console.error('Error fetching Gmail:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send email draft
app.post('/api/gmail/draft', async (req, res) => {
  try {
    const { idToken, subject, body, to, threadId } = req.body;
    
    const gmail = await getGmailClient(idToken);
    
    // Create email message
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      body
    ].join('\n');
    
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    const draft = await gmail.users.drafts.create({
      userId: 'me',
      requestBody: {
        message: {
          raw: encodedMessage,
          threadId: threadId || undefined
        }
      }
    });
    
    res.json({ success: true, draftId: draft.data.id });
  } catch (error) {
    console.error('Error creating draft:', error);
    res.status(500).json({ error: error.message });
  }
});

// Store OAuth tokens (called after Google OAuth redirect)
app.post('/api/auth/store-tokens', async (req, res) => {
  try {
    const { idToken, authCode } = req.body;
    
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    // Exchange auth code for tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/callback'
    );
    
    const { tokens } = await oauth2Client.getToken(authCode);
    
    // Store tokens in your database
    await storeUserTokensInDB(uid, tokens);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error storing tokens:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper functions for Firestore database operations
async function getUserTokensFromDB(uid) {
  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      return {
        accessToken: userData.accessToken,
        refreshToken: userData.refreshToken || null,
        email: userData.email,
        displayName: userData.displayName
      };
    }
    throw new Error('User not found');
  } catch (error) {
    console.error('Error retrieving user tokens:', error);
    throw error;
  }
}

async function storeUserTokensInDB(uid, tokens) {
  try {
    await admin.firestore().collection('users').doc(uid).set({
      ...tokens,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error storing user tokens:', error);
    throw error;
  }
}

// AI-powered email draft generation
app.post('/api/ai/generate-draft', async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({ error: 'Gemini AI not initialized' });
    }

    const { emailContent, draftType = 'reply' } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    let prompt = '';
    if (draftType === 'reply') {
      prompt = `Generate a professional email reply based on the following email content. 
      
Email to reply to:
${emailContent}

Guidelines:
- Keep it concise and professional
- Match the tone of the original email
- If it's a meeting request, ask for an agenda
- If it's a task request, acknowledge and provide timeline
- Be polite and helpful

Return only the reply text, not including subject line.`;
    } else if (draftType === 'followup') {
      prompt = `Generate a polite follow-up email based on the following context:

Context:
${emailContent}

Guidelines:
- Professional and courteous
- Reference the previous conversation
- Ask for update or next steps
- Keep it brief and to the point

Return only the email body text.`;
    } else {
      prompt = `Generate a professional email based on this content:

${emailContent}

Keep it clear, concise, and professional.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const draftText = response.text();

    res.json({ draft: draftText });
  } catch (error) {
    console.error('Error generating draft:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI-powered agent chat responses
app.post('/api/ai/chat', async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({ error: 'Gemini AI not initialized' });
    }

    const { message, context } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are an intelligent email assistant helping with email management. 

User query: ${message}

Context (emails or previous conversation):
${context || 'No additional context provided'}

Provide a helpful, concise response. You can:
- Summarize emails
- Extract action items
- Suggest next steps
- Draft responses
- Prioritize emails

Keep responses practical and actionable.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error generating AI response:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI-powered email categorization and analysis
app.post('/api/ai/analyze-email', async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({ error: 'Gemini AI not initialized' });
    }

    const { email } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analyze this email and provide:

Email:
Subject: ${email.subject}
From: ${email.sender}
Body: ${email.body}

Provide a JSON response with:
{
  "category": "Important|Newsletter|Spam|To-Do",
  "priority": "high|medium|low",
  "actionItems": [
    {"task": "description", "deadline": "date or null"}
  ],
  "sentiment": "positive|neutral|negative",
  "summary": "brief summary"
}

Analyze based on:
- Important: urgent matters, critical updates, time-sensitive
- Newsletter: marketing, updates, promotional
- Spam: suspicious offers, unwanted content
- To-Do: requires user action

Return only valid JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    // Clean the response to extract only JSON
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;

    const analysis = JSON.parse(jsonStr);
    res.json({ analysis });
  } catch (error) {
    console.error('Error analyzing email:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});