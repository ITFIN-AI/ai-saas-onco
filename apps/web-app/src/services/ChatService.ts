import { ChatSessionDocument, ChatMessage, ChatHistoryDocument } from '@akademiasaas/shared';

export interface SendMessageRequest {
  message: string;
  email: string;
  sessionId: string;
}

export interface SendMessageResponse {
  messageId: string;
  response: string;
}

export interface ChatServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ChatService {
  private baseUrl: string;

  constructor() {
    // Use Firebase Functions URL for production, localhost for development
    this.baseUrl = import.meta.env.VITE_FUNCTION_DOMAIN || 'http://localhost:5001';
  }

  async sendMessage(request: SendMessageRequest): Promise<ChatServiceResponse<SendMessageResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to send message',
          message: data.message || 'Unknown error occurred',
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error('ChatService.sendMessage error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Failed to connect to chat service',
      };
    }
  }

  async getChatHistory(sessionId: string, email: string): Promise<ChatServiceResponse<ChatSessionDocument>> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/getChatHistory/${sessionId}?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to get chat history',
          message: data.message || 'Unknown error occurred',
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error('ChatService.getChatHistory error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Failed to connect to chat service',
      };
    }
  }

  async getChatHistoryFromPostgres(email: string): Promise<ChatServiceResponse<ChatHistoryDocument>> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/getChatHistoryFromPostgres?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to get chat history',
          message: data.message || 'Unknown error occurred',
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error('ChatService.getChatHistoryFromPostgres error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Failed to connect to chat service',
      };
    }
  }

  generateSessionId(email: string): string {
    // Generate a unique session ID based on email and timestamp
    const timestamp = Date.now();
    const emailHash = btoa(email).replace(/[^a-zA-Z0-9]/g, '');
    return `chat_${emailHash}_${timestamp}`;
  }
}

export const chatService = new ChatService();
