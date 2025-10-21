# Chat History Restoration Summary

## Overview
Restored the functionality of showing chat history based on session ID and email. The chat system now properly tracks conversations, stores them in both Firestore and PostgreSQL, and allows users to view their chat history.

## Changes Made

### 1. Backend - SendMessageUseCase.ts
**File:** `apps/functions/src/modules/chat/useCases/sendMessage/SendMessageUseCase.ts`

#### Fixed n8n Webhook Integration
- **Issue:** The webhook was being called with a hardcoded `sessionId: 'default'` instead of using the actual session ID from the request
- **Fix:** Updated `callN8nWebhook` method to:
  - Accept `sessionId` and `email` as parameters
  - Pass the actual session ID and email to the n8n webhook
  - Add validation to ensure `N8N_WEBHOOK_URL` is configured

**Changes:**
```typescript
// Before:
private async callN8nWebhook(message: string): Promise<string> {
  const requestBody = {
    action: 'sendMessage',
    chatInput: message,
    sessionId: 'default',  // ❌ Hardcoded!
  };
}

// After:
private async callN8nWebhook(message: string, sessionId: string, email: string): Promise<string> {
  if (!this.N8N_WEBHOOK_URL) {
    throw new Error('N8N_WEBHOOK_URL is not configured');
  }
  
  const requestBody = {
    action: 'sendMessage',
    chatInput: message,
    sessionId: sessionId,  // ✅ Uses actual session
    email: email,          // ✅ Includes email for tracking
  };
}
```

### 2. Frontend - SimpleChatInterface.tsx
**File:** `apps/web-app/src/components/ChatInterface/SimpleChatInterface.tsx`

#### Migrated from Direct n8n Calls to Backend Service
- **Issue:** `SimpleChatInterface` was using `AIChatBotService` which called n8n directly, bypassing the backend and not storing chat history
- **Fix:** Updated to use `ChatService` which:
  - Routes through Firebase Functions backend
  - Stores messages in both Firestore and PostgreSQL
  - Maintains session tracking

**Changes:**
```typescript
// Before:
import { aiChatBotService, ChatMessage } from '../../services/AIChatBotService';

interface SimpleChatInterfaceProps {
  onNewMessage?: (message: ChatMessage) => void;
}

// No email prop, no session tracking, no history loading

// After:
import { ChatMessage } from '@akademiasaas/shared';
import { chatService, SendMessageRequest } from '../../services/ChatService';

interface SimpleChatInterfaceProps {
  email?: string;  // ✅ Added email prop
  onNewMessage?: (message: ChatMessage) => void;
}

// ✅ Added session ID generation
const [sessionId] = useState(() => chatService.generateSessionId(email));

// ✅ Added chat history loading on mount
useEffect(() => {
  loadChatHistory();
}, [sessionId, email]);
```

### 3. Frontend - Welcome.tsx
**File:** `apps/web-app/src/pages/Welcome/Welcome.tsx`

#### Pass Email to Chat Interface
- **Fix:** Updated to pass the user's email to `SimpleChatInterface` so conversations can be tracked

**Changes:**
```typescript
// Before:
<SimpleChatInterface />

// After:
<SimpleChatInterface email={formData.email} />
```

## Architecture Overview

### Data Flow

```
User → SimpleChatInterface (Frontend)
  ↓
ChatService (Frontend Service)
  ↓
Firebase Functions → sendMessage endpoint
  ↓
SendMessageUseCase (Backend)
  ↓
├─→ Save to Firestore (chatSessions collection)
├─→ Save to PostgreSQL (chat_sessions & chat_messages tables)
└─→ Call n8n webhook with sessionId & email
     ↓
     AI Response
     ↓
├─→ Save to Firestore
└─→ Save to PostgreSQL
```

### Data Storage

#### Firestore Collection: `chatSessions`
```typescript
{
  id: string,
  email: string,
  sessionId: string,
  messages: ChatMessage[],
  status: 'active' | 'completed' | 'archived',
  createdAt: Date,
  updatedAt: Date,
  metadata: {
    totalMessages: number,
    lastActivity: Date
  }
}
```

#### PostgreSQL Tables

**chat_sessions:**
- session_id (PK)
- email
- status
- created_at
- updated_at
- last_activity

**chat_messages:**
- id (PK)
- session_id (FK)
- content
- role ('user' | 'assistant')
- timestamp

## Available Endpoints

### 1. Send Message
- **Endpoint:** `POST /chat/sendMessage`
- **Request:**
  ```json
  {
    "message": "User message",
    "email": "user@example.com",
    "sessionId": "chat_abc123_1234567890"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "messageId": "uuid",
      "response": "AI response"
    }
  }
  ```

### 2. Get Chat History (Single Session)
- **Endpoint:** `GET /chat/getChatHistory/:sessionId?email=user@example.com`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "sessionId",
      "email": "user@example.com",
      "messages": [
        {
          "id": "msg1",
          "content": "Hello",
          "role": "user",
          "timestamp": "2025-10-21T10:00:00Z"
        },
        ...
      ]
    }
  }
  ```

### 3. Get Chat History from PostgreSQL (All Sessions)
- **Endpoint:** `GET /chat/getChatHistoryFromPostgres?email=user@example.com`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "sessions": [
        {
          "session_id": "chat_abc123_1234567890",
          "email": "user@example.com",
          "status": "active",
          "message_count": 10,
          "first_message": "Hello...",
          "last_activity": "2025-10-21T10:00:00Z"
        },
        ...
      ],
      "totalSessions": 5
    }
  }
  ```

## Components Available for Use

### 1. ChatInterface
**File:** `apps/web-app/src/components/ChatInterface/ChatInterface.tsx`

Full-featured chat interface with history loading.

**Usage:**
```tsx
import ChatInterface from '~/components/ChatInterface/ChatInterface';

<ChatInterface 
  email="user@example.com"
  sessionId="chat_abc123_1234567890"
  onHistoryLoaded={(messages) => console.log('History loaded:', messages)}
/>
```

### 2. SimpleChatInterface
**File:** `apps/web-app/src/components/ChatInterface/SimpleChatInterface.tsx`

Simplified chat interface (used in Welcome page).

**Usage:**
```tsx
import SimpleChatInterface from '~/components/ChatInterface/SimpleChatInterface';

<SimpleChatInterface 
  email="user@example.com"
  onNewMessage={(message) => console.log('New message:', message)}
/>
```

### 3. ChatHistory
**File:** `apps/web-app/src/components/ChatHistory/ChatHistory.tsx`

Shows list of all chat sessions for a user.

**Usage:**
```tsx
import ChatHistory from '~/components/ChatHistory/ChatHistory';

<ChatHistory 
  email="user@example.com"
  onSessionSelect={(sessionId) => console.log('Selected:', sessionId)}
  selectedSessionId="chat_abc123_1234567890"
/>
```

## Benefits

1. **Session Persistence:** Conversations are now properly tracked and can be resumed
2. **User Isolation:** Each user's conversations are isolated by email
3. **Dual Storage:** Data stored in both Firestore (real-time) and PostgreSQL (analytics/backup)
4. **Context Awareness:** n8n receives session context, enabling better AI responses
5. **History Access:** Users can view past conversations via `ChatHistory` component

## Testing

To test the restored functionality:

1. **Start a new chat:**
   - Go to Welcome page
   - Enter email and access code
   - Start chatting
   - Note the session ID in the header

2. **Verify storage:**
   - Check Firestore: `chatSessions/{sessionId}`
   - Check PostgreSQL: Query `chat_sessions` and `chat_messages` tables

3. **Load history:**
   - Use `ChatHistory` component to see all sessions for an email
   - Click on a session to load it in `ChatInterface`
   - Verify messages are loaded correctly

4. **Resume conversation:**
   - Send a new message in an existing session
   - Verify n8n receives the correct session ID
   - Verify AI maintains conversation context

## Environment Variables Required

```bash
# Backend (Firebase Functions)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/...

# Frontend
VITE_FIREBASE_EMULATOR=true  # For development
VITE_FUNCTION_DOMAIN=https://your-domain.com  # For production
```

## Next Steps (Optional Enhancements)

1. **Add session management UI:**
   - Archive old sessions
   - Delete sessions
   - Rename sessions

2. **Add search functionality:**
   - Search within messages
   - Filter by date range

3. **Add export functionality:**
   - Export chat history as PDF/JSON
   - Share conversation links

4. **Add real-time updates:**
   - Use Firestore listeners for live updates
   - Show when AI is typing

5. **Add analytics:**
   - Track message counts
   - Monitor response times
   - User engagement metrics

## Notes

- The `AIChatBotService` is still available but is no longer used by `SimpleChatInterface`
- Session IDs are generated using: `chat_{emailHash}_{timestamp}`
- All timestamps are stored as UTC
- The system supports both Firebase emulator (development) and production environments

