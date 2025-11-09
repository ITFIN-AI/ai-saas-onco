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
    const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

    const isEmulatorFlagEnabled = import.meta.env.VITE_FIREBASE_EMULATOR === 'true';

    const isLocalhost =
      typeof window !== 'undefined' &&
      ['localhost', '127.0.0.1'].includes(window.location.hostname);

    if (isEmulatorFlagEnabled && isLocalhost) {
      const emulatorHost =
        import.meta.env.VITE_FUNCTIONS_EMULATOR_HOST ?? 'http://localhost:5001';
      this.baseUrl = normalizeBaseUrl(emulatorHost);
      return;
    }

    if (import.meta.env.VITE_FUNCTION_DOMAIN) {
      this.baseUrl = normalizeBaseUrl(import.meta.env.VITE_FUNCTION_DOMAIN);
      return;
    }

    this.baseUrl = '/api';
  }

  private async handleResponse<T>(response: Response): Promise<ChatServiceResponse<T>> {
    const contentType = response.headers.get('content-type') ?? '';
    const responseText = await response.text();

    let parsedBody: unknown;

    if (contentType.includes('application/json')) {
      try {
        parsedBody = responseText ? JSON.parse(responseText) : {};
      } catch (error) {
        console.error('ChatService: Failed to parse JSON response', {
          error,
          responseText,
        });
      }
    }

    if (!response.ok) {
      const errorPayload = parsedBody as { error?: string; message?: string } | undefined;

      const errorMessage = (errorPayload?.message ?? responseText) || 'Unknown error occurred';

      return {
        success: false,
        error: errorPayload?.error ?? `HTTP_${response.status}`,
        message: errorMessage,
      };
    }

    if (parsedBody && typeof parsedBody === 'object' && 'data' in parsedBody) {
      return {
        success: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: (parsedBody as any).data,
      };
    }

    console.error('ChatService: Unexpected success response format', {
      responseText,
      contentType,
      status: response.status,
    });

    return {
      success: false,
      error: 'INVALID_RESPONSE',
      message: 'Unexpected response format from chat service',
    };
  }

  async sendMessage(request: SendMessageRequest): Promise<ChatServiceResponse<SendMessageResponse>> {
    try {
      const url = `${this.baseUrl}/chat/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      return await this.handleResponse<SendMessageResponse>(response);
    } catch (error) {
      console.error('ChatService.sendMessage error:', error);
      console.error('ChatService.sendMessage baseUrl:', this.baseUrl);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Failed to connect to chat service',
      };
    }
  }

  async getChatHistory(sessionId: string, email: string): Promise<ChatServiceResponse<ChatSessionDocument>> {
    try {
      const url = `${this.baseUrl}/chat/getChatHistory/${sessionId}?email=${encodeURIComponent(email)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await this.handleResponse<ChatSessionDocument>(response);
    } catch (error) {
      console.error('ChatService.getChatHistory error:', error);
      console.error('ChatService.getChatHistory baseUrl:', this.baseUrl);
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

      const handledResponse = await this.handleResponse<ChatHistoryDocument>(response);

      if (!handledResponse.success) {
        console.error('ChatService: Response not ok:', handledResponse);
      }

      return handledResponse;
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
