import React, { useState, useEffect } from 'react';
import { Mail, Send, Edit3, Save, Inbox, MessageSquare, Settings, Plus, Trash2, FileText, CheckCircle } from 'lucide-react';

// Mock Inbox Data
const MOCK_INBOX = [
  {
    id: 1,
    sender: "john.doe@company.com",
    subject: "Q4 Budget Review Meeting",
    timestamp: "2024-11-20T09:30:00",
    body: "Hi team, I'd like to schedule a meeting next week to review the Q4 budget. Please let me know your availability for Tuesday or Wednesday afternoon. We need to finalize the numbers by Friday.",
    category: null,
    actionItems: []
  },
  {
    id: 2,
    sender: "newsletter@techcrunch.com",
    subject: "Daily Tech News - November 20",
    timestamp: "2024-11-20T08:00:00",
    body: "Your daily dose of tech news: AI breakthroughs, startup funding rounds, and the latest in tech policy. Click here to read more...",
    category: null,
    actionItems: []
  },
  {
    id: 3,
    sender: "urgent@client.com",
    subject: "URGENT: Production Server Down",
    timestamp: "2024-11-20T14:15:00",
    body: "Our production server is experiencing downtime. Please investigate immediately and provide an ETA for resolution. Our business operations are affected.",
    category: null,
    actionItems: []
  },
  {
    id: 4,
    sender: "hr@company.com",
    subject: "Action Required: Complete Annual Training by Nov 30",
    timestamp: "2024-11-19T10:00:00",
    body: "This is a reminder to complete your mandatory annual compliance training. The deadline is November 30th. Please log into the training portal and complete all modules.",
    category: null,
    actionItems: []
  },
  {
    id: 5,
    sender: "promotions@store.com",
    subject: "🎉 50% OFF Everything - Limited Time!",
    timestamp: "2024-11-19T16:45:00",
    body: "Don't miss out! Get 50% off on all items. Shop now and save big. Offer expires soon. Click here to claim your discount!",
    category: null,
    actionItems: []
  },
  {
    id: 6,
    sender: "sarah.johnson@partner.com",
    subject: "Partnership Proposal Discussion",
    timestamp: "2024-11-18T11:20:00",
    body: "I'd love to discuss a potential partnership between our companies. Would you be available for a call this week? I believe we could create significant value together.",
    category: null,
    actionItems: []
  },
  {
    id: 7,
    sender: "project.updates@company.com",
    subject: "Project Alpha - Milestone 3 Completed",
    timestamp: "2024-11-18T15:30:00",
    body: "Great news! The development team has successfully completed Milestone 3 of Project Alpha. We're on track for the December launch. Next steps: QA testing and user acceptance.",
    category: null,
    actionItems: []
  },
  {
    id: 8,
    sender: "noreply@spam.biz",
    subject: "You've Won $1,000,000!!!",
    timestamp: "2024-11-17T22:10:00",
    body: "Congratulations! You are the lucky winner of our grand prize. Click here to claim your prize now. Act fast before it expires!",
    category: null,
    actionItems: []
  },
  {
    id: 9,
    sender: "lisa.chen@company.com",
    subject: "Code Review Request - Feature Branch",
    timestamp: "2024-11-17T13:45:00",
    body: "Hi, I've pushed my changes to the feature/user-authentication branch. Could you please review the code when you get a chance? I need approval before merging to main.",
    category: null,
    actionItems: []
  },
  {
    id: 10,
    sender: "events@conference.com",
    subject: "Tech Summit 2025 - Early Bird Registration",
    timestamp: "2024-11-16T09:00:00",
    body: "Register now for Tech Summit 2025! Early bird pricing ends December 1st. Join industry leaders for three days of innovation, networking, and learning.",
    category: null,
    actionItems: []
  }
];

// Default Prompts
const DEFAULT_PROMPTS = {
  categorization: `Categorize the following email into one of these categories: Important, Newsletter, Spam, To-Do.

Rules:
- Important: Urgent matters, critical updates, or time-sensitive information
- Newsletter: Marketing content, updates, promotional materials
- Spam: Suspicious offers, unwanted promotional content
- To-Do: Direct requests requiring user action

Return only the category name.`,
  
  actionItem: `Extract actionable tasks from the following email. 

Return a JSON array of tasks in this format:
[{"task": "description", "deadline": "date or null"}]

If no action items exist, return an empty array: []`,
  
  autoReply: `Generate a professional and polite email reply based on the following email.

Guidelines:
- If it's a meeting request, ask for an agenda
- If it's a task request, acknowledge and provide timeline
- Keep it concise and professional
- Match the tone of the original email

Return only the reply text without subject line.`
};

const EmailAgent = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [activeTab, setActiveTab] = useState('inbox');
  const [prompts, setPrompts] = useState(DEFAULT_PROMPTS);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [drafts, setDrafts] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [draftContent, setDraftContent] = useState({ subject: '', body: '' });

  useEffect(() => {
    loadInbox();
  }, []);

  const loadInbox = () => {
    const loadedEmails = MOCK_INBOX.map(email => ({
      ...email,
      category: null,
      actionItems: []
    }));
    setEmails(loadedEmails);
  };

  const processEmails = async () => {
    setProcessing(true);
    
    // Simulate LLM processing with realistic categorization
    const processedEmails = emails.map(email => {
      let category = 'Important';
      let actionItems = [];
      
      // Simple rule-based categorization for demo
      if (email.subject.toLowerCase().includes('newsletter') || 
          email.sender.includes('newsletter') ||
          email.subject.includes('Daily')) {
        category = 'Newsletter';
      } else if (email.subject.toLowerCase().includes('won') || 
                 email.subject.includes('!!!') ||
                 email.subject.includes('50% OFF')) {
        category = 'Spam';
      } else if (email.body.toLowerCase().includes('please') || 
                 email.body.toLowerCase().includes('need to') ||
                 email.subject.toLowerCase().includes('action required')) {
        category = 'To-Do';
        
        // Extract action items for To-Do emails
        if (email.subject.includes('Code Review')) {
          actionItems = [{ task: 'Review code in feature/user-authentication branch', deadline: 'ASAP' }];
        } else if (email.subject.includes('Training')) {
          actionItems = [{ task: 'Complete annual compliance training', deadline: 'November 30' }];
        } else if (email.subject.includes('Meeting')) {
          actionItems = [{ task: 'Provide availability for Q4 budget meeting', deadline: 'This week' }];
        }
      } else if (email.subject.toLowerCase().includes('urgent')) {
        category = 'Important';
        actionItems = [{ task: 'Investigate production server downtime', deadline: 'Immediate' }];
      }
      
      return { ...email, category, actionItems };
    });
    
    setTimeout(() => {
      setEmails(processedEmails);
      setProcessing(false);
    }, 1500);
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = { role: 'user', content: chatInput };
    setChatMessages([...chatMessages, userMessage]);
    
    // Simulate agent response
    let response = '';
    const query = chatInput.toLowerCase();
    
    if (query.includes('summarize') && selectedEmail) {
      response = `Summary: ${selectedEmail.subject}\n\nFrom: ${selectedEmail.sender}\n\nKey points: ${selectedEmail.body.substring(0, 150)}...`;
    } else if (query.includes('urgent') || query.includes('important')) {
      const urgentEmails = emails.filter(e => e.category === 'Important');
      response = `You have ${urgentEmails.length} urgent emails:\n${urgentEmails.map(e => `- ${e.subject}`).join('\n')}`;
    } else if (query.includes('tasks') || query.includes('to-do')) {
      const allTasks = emails.flatMap(e => e.actionItems);
      response = allTasks.length > 0 
        ? `Your tasks:\n${allTasks.map((t, i) => `${i + 1}. ${t.task} (${t.deadline})`).join('\n')}`
        : 'No pending tasks found.';
    } else if (query.includes('draft') && selectedEmail) {
      response = `I've created a draft reply. Check the Drafts tab to review and edit it.`;
      generateDraft(selectedEmail);
    } else {
      response = "I can help you summarize emails, find urgent messages, list tasks, or draft replies. Try asking 'Show me urgent emails' or 'Draft a reply'.";
    }
    
    const agentMessage = { role: 'agent', content: response };
    setChatMessages([...chatMessages, userMessage, agentMessage]);
    setChatInput('');
  };

  const generateDraft = (email) => {
    let draftBody = '';
    
    if (email.subject.toLowerCase().includes('meeting')) {
      draftBody = `Hi ${email.sender.split('@')[0]},\n\nThank you for reaching out. I'd be happy to join the meeting.\n\nCould you please share an agenda beforehand so I can prepare accordingly? I'm available on both Tuesday and Wednesday afternoons.\n\nLooking forward to the discussion.\n\nBest regards`;
    } else if (email.subject.toLowerCase().includes('code review')) {
      draftBody = `Hi ${email.sender.split('@')[0]},\n\nI'll review your code changes today and provide feedback by end of day.\n\nThanks for the heads up!\n\nBest`;
    } else if (email.subject.toLowerCase().includes('urgent')) {
      draftBody = `Hi ${email.sender.split('@')[0]},\n\nI've received your urgent message and am investigating the issue immediately. I'll provide an update within the next hour with an ETA for resolution.\n\nThank you for bringing this to our attention.\n\nBest regards`;
    } else {
      draftBody = `Hi ${email.sender.split('@')[0]},\n\nThank you for your email regarding "${email.subject}".\n\n[Your response here]\n\nBest regards`;
    }
    
    const newDraft = {
      id: Date.now(),
      originalEmailId: email.id,
      subject: `Re: ${email.subject}`,
      body: draftBody,
      createdAt: new Date().toISOString()
    };
    
    setDrafts([...drafts, newDraft]);
  };

  const saveDraft = () => {
    if (!draftContent.subject || !draftContent.body) return;
    
    const newDraft = {
      id: Date.now(),
      originalEmailId: selectedEmail?.id || null,
      subject: draftContent.subject,
      body: draftContent.body,
      createdAt: new Date().toISOString()
    };
    
    setDrafts([...drafts, newDraft]);
    setDraftContent({ subject: '', body: '' });
    setActiveTab('drafts');
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Important': 'bg-red-100 text-red-800',
      'Newsletter': 'bg-blue-100 text-blue-800',
      'Spam': 'bg-gray-100 text-gray-800',
      'To-Do': 'bg-green-100 text-green-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Mail className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Email Productivity Agent</h1>
          </div>
          <button
            onClick={processEmails}
            disabled={processing}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{processing ? 'Processing...' : 'Process Emails'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex space-x-1 px-6">
          {['inbox', 'agent', 'drafts', 'prompts'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'inbox' && <Inbox className="w-4 h-4 inline mr-2" />}
              {tab === 'agent' && <MessageSquare className="w-4 h-4 inline mr-2" />}
              {tab === 'drafts' && <FileText className="w-4 h-4 inline mr-2" />}
              {tab === 'prompts' && <Settings className="w-4 h-4 inline mr-2" />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Inbox View */}
        {activeTab === 'inbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Inbox ({emails.length})</h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {emails.map(email => (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedEmail?.id === email.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-900">{email.sender}</span>
                          {email.category && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(email.category)}`}>
                              {email.category}
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-gray-800 mb-1">{email.subject}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(email.timestamp).toLocaleString()}
                        </p>
                        {email.actionItems.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {email.actionItems.map((item, idx) => (
                              <div key={idx} className="text-sm text-green-700 flex items-start">
                                <CheckCircle className="w-3 h-3 mr-1 mt-0.5" />
                                <span>{item.task}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              {selectedEmail ? (
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{selectedEmail.subject}</h3>
                  <div className="space-y-3 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">From:</span> {selectedEmail.sender}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Date:</span> {new Date(selectedEmail.timestamp).toLocaleString()}
                    </p>
                    {selectedEmail.category && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Category:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getCategoryColor(selectedEmail.category)}`}>
                          {selectedEmail.category}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedEmail.body}</p>
                  </div>
                  {selectedEmail.actionItems.length > 0 && (
                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <h4 className="font-semibold mb-2">Action Items:</h4>
                      <ul className="space-y-2">
                        {selectedEmail.actionItems.map((item, idx) => (
                          <li key={idx} className="flex items-start text-sm">
                            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600" />
                            <div>
                              <p className="font-medium">{item.task}</p>
                              <p className="text-gray-500">Deadline: {item.deadline}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      generateDraft(selectedEmail);
                      setActiveTab('drafts');
                    }}
                    className="mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Generate Draft Reply
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  Select an email to view details
                </div>
              )}
            </div>
          </div>
        )}

        {/* Agent Chat View */}
        {activeTab === 'agent' && (
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Email Agent Chat</h2>
              <p className="text-sm text-gray-600 mt-1">
                Ask me to summarize emails, find urgent messages, list tasks, or draft replies
              </p>
            </div>
            <div className="h-[500px] overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Start a conversation with the Email Agent</p>
                  <div className="mt-4 text-sm space-y-2">
                    <p className="font-medium">Try asking:</p>
                    <p>"Show me all urgent emails"</p>
                    <p>"What tasks do I need to do?"</p>
                    <p>"Summarize this email"</p>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                  placeholder="Ask the agent..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleChatSubmit}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Drafts View */}
        {activeTab === 'drafts' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Create New Draft</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Subject"
                  value={draftContent.subject}
                  onChange={(e) => setDraftContent({ ...draftContent, subject: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Email body..."
                  value={draftContent.body}
                  onChange={(e) => setDraftContent({ ...draftContent, body: e.target.value })}
                  rows={10}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={saveDraft}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Draft</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Saved Drafts ({drafts.length})</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {drafts.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No drafts yet. Generate replies or create new drafts above.
                  </div>
                ) : (
                  drafts.map(draft => (
                    <div key={draft.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{draft.subject}</h3>
                        <button
                          onClick={() => setDrafts(drafts.filter(d => d.id !== draft.id))}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(draft.createdAt).toLocaleString()}
                      </p>
                      <p className="text-gray-800 whitespace-pre-wrap">{draft.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Prompts Configuration */}
        {activeTab === 'prompts' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {Object.entries(prompts).map(([key, value]) => (
              <div key={key} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold capitalize">{key} Prompt</h3>
                  <button
                    onClick={() => setEditingPrompt(editingPrompt === key ? null : key)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{editingPrompt === key ? 'Cancel' : 'Edit'}</span>
                  </button>
                </div>
                {editingPrompt === key ? (
                  <div className="space-y-3">
                    <textarea
                      value={value}
                      onChange={(e) => setPrompts({ ...prompts, [key]: e.target.value })}
                      rows={8}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                    <button
                      onClick={() => setEditingPrompt(null)}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Prompt</span>
                    </button>
                  </div>
                ) : (
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap font-mono text-gray-700">
                    {value}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailAgent;