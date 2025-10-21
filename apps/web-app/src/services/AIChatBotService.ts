/**
 * Direct AI ChatBot Service
 * Connects directly to the external AI chatbot API without Firebase/Functions
 */

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface SendMessageRequest {
  message: string;
}

export interface SendMessageResponse {
  response: string;
  messageId: string;
}

export interface ChatServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class AIChatBotService {
  private apiUrl: string;
  private sessionId: string | null = null;

  constructor() {
    // Direct connection to AI chatbot
    this.apiUrl = 'https://aiforyou.agency/webhook/c96c6980-2b2a-4143-af67-c83677e257b2/chat';
  }

  /**
   * Send a message to the n8n AI chatbot
   */
  async sendMessage(message: string): Promise<ChatServiceResponse<string>> {
    try {
      // Generate or reuse session ID for conversation continuity
      if (!this.sessionId) {
        this.sessionId = this.generateSessionId();
      }
      
      // n8n AI Agent Chat typically expects:
      // - chatInput: the user's message
      // - sessionId: for conversation memory
      const requestBody = {
        chatInput: message,
        sessionId: this.sessionId,
      };
      
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });


      // Get response text first
      const responseText = await response.text();

      if (!response.ok) {
        console.error('AIChatBotService: Error response:', responseText);
        return {
          success: false,
          error: `HTTP ${response.status}`,
          message: responseText || 'Failed to get response from AI chatbot',
        };
      }

      // Try to parse JSON response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // If not JSON, treat as plain text response
        return {
          success: true,
          data: responseText,
        };
      }


      // Handle different n8n response formats
      let aiResponse: string;
      
      if (typeof data === 'string') {
        aiResponse = data;
      } else if (data.output) {
        // n8n AI Agent output
        aiResponse = data.output;
      } else if (data.response) {
        aiResponse = data.response;
      } else if (data.text) {
        aiResponse = data.text;
      } else if (data.message) {
        aiResponse = data.message;
      } else if (data.answer) {
        aiResponse = data.answer;
      } else if (data.data?.translations?.[0]?.translatedText) {
        // Handle nested structure: {"data":{"translations":[{"translatedText":"..."}]}}
        aiResponse = data.data.translations[0].translatedText;
      } else if (data.translations?.[0]?.translatedText) {
        // Handle flat structure: {"translations":[{"translatedText":"..."}]}
        aiResponse = data.translations[0].translatedText;
      } else if (data.data && typeof data.data === 'string') {
        // Handle if data.data is a string
        aiResponse = data.data;
      } else if (data.data) {
        // Fallback: stringify nested data
        aiResponse = JSON.stringify(data.data);
      } else {
        console.warn('AIChatBotService: Unknown response format, stringifying:', data);
        aiResponse = JSON.stringify(data);
      }

      return {
        success: true,
        data: aiResponse,
      };
    } catch (error) {
      console.error('AIChatBotService.sendMessage error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Failed to connect to AI chatbot',
      };
    }
  }

  /**
   * Generate a simple session ID for local tracking
   */
  generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `session_${timestamp}_${random}`;
  }

  /**
   * Reset the current session (start a new conversation)
   */
  resetSession(): void {
    this.sessionId = null;
  }

  /**
   * Get the current session ID
   */
  getCurrentSessionId(): string | null {
    return this.sessionId;
  }
}

export const aiChatBotService = new AIChatBotService();

