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
   * Send a message to the n8n AI chatbot
   */
  async sendMessage(message: string): Promise<ChatServiceResponse<string>> {
    try {
      console.log('AIChatBotService: Sending message to n8n:', this.apiUrl);
      console.log('AIChatBotService: Message:', message);
      
      // n8n chat webhooks typically expect one of these formats:
      // Try common n8n chat webhook formats
      const requestBody = {
        chatInput: message,  // Common for n8n AI chat
        message: message,
        question: message,
        input: message,
        text: message
      };
      
      console.log('AIChatBotService: Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('AIChatBotService: Response status:', response.status);
      console.log('AIChatBotService: Response headers:', Object.fromEntries(response.headers.entries()));

      // Get response text first
      const responseText = await response.text();
      console.log('AIChatBotService: Raw response:', responseText);

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
        console.log('AIChatBotService: Response is plain text, not JSON');
        return {
          success: true,
          data: responseText,
        };
      }

      console.log('AIChatBotService: Parsed response data:', data);

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
      } else if (data.data) {
        aiResponse = data.data;
      } else if (data.answer) {
        aiResponse = data.answer;
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
}

export const aiChatBotService = new AIChatBotService();

