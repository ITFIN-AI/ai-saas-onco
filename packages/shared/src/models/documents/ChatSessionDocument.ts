import { BaseDocument } from './BaseDocument';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  metadata?: {
    messageId?: string;
    processingTime?: number;
    tokenCount?: number;
  };
}

export interface ChatSessionDocument extends BaseDocument {
  id: string;
  email: string;
  sessionId: string;
  messages: ChatMessage[];
  status: 'active' | 'completed' | 'archived';
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    totalMessages?: number;
    lastActivity?: Date;
  };
}
