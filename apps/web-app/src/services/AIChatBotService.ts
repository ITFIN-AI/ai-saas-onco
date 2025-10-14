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

  constructor() {
    // Direct connection to AI chatbot
    this.apiUrl = 'https://aiforyou.agency/webhook/efbc64f9-36f3-415d-b219-49bfd55d1a59/chat';
  }

  /**
   * Send a message to the AI chatbot
   */
  async sendMessage(message: string): Promise<ChatServiceResponse<string>> {
    try {
      console.log('AIChatBotService: Sending message to:', this.apiUrl);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      console.log('AIChatBotService: Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AIChatBotService: Error response:', errorText);
        return {
          success: false,
          error: `HTTP ${response.status}`,
          message: 'Failed to get response from AI chatbot',
        };
      }

      // Try to parse JSON response
      const data = await response.json();
      console.log('AIChatBotService: Response data:', data);

      // Handle different response formats
      let aiResponse: string;
      
      if (typeof data === 'string') {
        aiResponse = data;
      } else if (data.response) {
        aiResponse = data.response;
      } else if (data.message) {
        aiResponse = data.message;
      } else if (data.data) {
        aiResponse = data.data;
      } else {
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
}

export const aiChatBotService = new AIChatBotService();

