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
    // Use Firebase Functions URL based on environment
    // - Emulator: localhost with project ID and region
    // - Production: use nginx proxy at /api/chat
    const isEmulator = import.meta.env.VITE_FIREBASE_EMULATOR === 'true';
    
    if (isEmulator) {
      // Development with Firebase emulator
      this.baseUrl = 'http://localhost:5001/ai-oncology/europe-central2';
    } else if (import.meta.env.VITE_FUNCTION_DOMAIN) {
      // Custom domain from environment variable
      this.baseUrl = import.meta.env.VITE_FUNCTION_DOMAIN;
    } else {
      // Production: use nginx proxy (relative path)
      this.baseUrl = '/api';
    }
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
    const url = `${this.baseUrl}/chat/getChatHistoryFromPostgres?email=${encodeURIComponent(email)}`;
    console.log('ChatService: Attempting to fetch from URL:', url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('ChatService: Response status:', response.status);
      // Log headers manually to avoid TypeScript iteration issues
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log('ChatService: Response headers:', headers);

      const data = await response.json();
      
      if (!response.ok) {
        console.error('ChatService: Response not ok:', data);
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
      console.error('ChatService: Base URL was:', this.baseUrl);
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
