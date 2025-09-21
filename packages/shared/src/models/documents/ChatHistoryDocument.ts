import { BaseDocument } from './BaseDocument';

export interface ChatHistoryMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  session_id: string;
  metadata?: {
    message_id?: string;
    processing_time?: number;
    token_count?: number;
  };
}

export interface ChatHistorySession {
  id: string;
  email: string;
  session_id: string;
  status: 'active' | 'completed' | 'archived';
  created_at: Date;
  updated_at: Date;
  last_activity: Date;
  message_count: number;
  first_message?: string;
}

export interface ChatHistoryDocument extends BaseDocument {
  sessions: ChatHistorySession[];
  totalSessions: number;
}
