import { v4 as uuidv4 } from 'uuid';
import { db, postgresPool } from '../../../../config/bootstrap';
import { FieldValue } from 'firebase-admin/firestore';
import { SendMessageDTO } from './SendMessageDTO';
import { SendMessageError } from './SendMessageErrors';
import { ChatSessionDocument, ChatMessage } from '@akademiasaas/shared';

export class SendMessageUseCase {
  private readonly N8N_WEBHOOK_URL =
    process.env.N8N_WEBHOOK_URL ||
    'https://aiforyou.agency/webhook/efbc64f9-36f3-415d-b219-49bfd55d1a59/chat';
  private readonly USE_MOCK_AI = process.env.USE_MOCK_AI === 'true';

  async execute(dto: SendMessageDTO): Promise<{ messageId: string; response: string }> {
    try {
      // Get or create chat session
      const session = await this.getOrCreateSession(dto.email, dto.sessionId);

      // Add user message to session
      const userMessage: ChatMessage = {
        id: uuidv4(),
        content: dto.message,
        role: 'user',
        timestamp: new Date(),
      };

      // Save user message
      await this.saveMessage(session.id, userMessage);

      // Call n8n webhook
      const aiResponse = await this.callN8nWebhook(dto.message);

      // Add AI response to session
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date(),
      };

      // Save AI message
      await this.saveMessage(session.id, aiMessage);

      // Also save to PostgreSQL
      await this.saveMessageToPostgres(dto.sessionId, dto.email, userMessage, aiMessage);

      return {
        messageId: aiMessage.id,
        response: aiResponse,
      };
    } catch (error) {
      console.error('SendMessageUseCase error:', error);
      throw new Error(SendMessageError.CHAT_SERVICE_ERROR);
    }
  }

  private async getOrCreateSession(email: string, sessionId: string): Promise<ChatSessionDocument> {
    const sessionsRef = db.collection('chatSessions');
    const sessionDoc = await sessionsRef.doc(sessionId).get();

    if (sessionDoc.exists) {
      return sessionDoc.data() as ChatSessionDocument;
    }

    // Create new session
    const newSession: ChatSessionDocument = {
      id: sessionId,
      email,
      sessionId,
      messages: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        totalMessages: 0,
        lastActivity: new Date(),
      },
    };

    await sessionsRef.doc(sessionId).set(newSession);

    return newSession;
  }

  private async saveMessage(sessionId: string, message: ChatMessage): Promise<void> {
    const sessionRef = db.collection('chatSessions').doc(sessionId);

    await sessionRef.update({
      messages: FieldValue.arrayUnion(message),
      updatedAt: new Date(),
      'metadata.lastActivity': new Date(),
      'metadata.totalMessages': FieldValue.increment(1),
    });
  }

  private async saveMessageToPostgres(
    sessionId: string,
    email: string,
    userMessage: ChatMessage,
    aiMessage: ChatMessage
  ): Promise<void> {
    try {
      const client = await postgresPool.connect();

      try {
        await client.query('BEGIN');

        // Create or update session
        await client.query(
          `
          INSERT INTO chat_sessions (session_id, email, status, created_at, updated_at, last_activity)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (session_id) 
          DO UPDATE SET 
            updated_at = $5,
            last_activity = $6
        `,
          [sessionId, email, 'active', new Date(), new Date(), new Date()]
        );

        // Insert user message
        await client.query(
          `
          INSERT INTO chat_messages (id, session_id, content, role, timestamp)
          VALUES ($1, $2, $3, $4, $5)
        `,
          [userMessage.id, sessionId, userMessage.content, userMessage.role, userMessage.timestamp]
        );

        // Insert AI message
        await client.query(
          `
          INSERT INTO chat_messages (id, session_id, content, role, timestamp)
          VALUES ($1, $2, $3, $4, $5)
        `,
          [aiMessage.id, sessionId, aiMessage.content, aiMessage.role, aiMessage.timestamp]
        );

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error saving to PostgreSQL:', error);
      // Don't throw here to avoid breaking the main flow
    }
  }

  private async callN8nWebhook(message: string): Promise<string> {
    // Use mock AI response in development if configured
    if (this.USE_MOCK_AI) {
      console.log('Using mock AI response for development');

      return `Mock AI response to: "${message}". This is a simulated response for development. Configure N8N_WEBHOOK_URL environment variable to use a real AI service.`;
    }

    try {
      // n8n chat webhooks expect 'chatInput' field, not 'message'
      const requestBody = {
        action: 'sendMessage',
        chatInput: message,
        sessionId: 'default',
      };

      console.log('Calling n8n webhook:', this.N8N_WEBHOOK_URL);
      console.log('Request body:', requestBody);

      const response = await fetch(this.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Webhook response status:', response.status);

      // Try to get response text regardless of status
      const responseText = await response.text();
      console.log('Webhook response body:', responseText);

      if (!response.ok) {
        console.error(`Webhook returned error status: ${response.status}`);
        console.error('Response body:', responseText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.log('Response is not JSON, using as plain text');
        // If response is plain text, return it directly
        return responseText || 'No response received';
      }

      // n8n chat webhooks typically return: { output: "response" } or { text: "response" } or { message: "response" }
      return (
        data.output ||
        data.text ||
        data.response ||
        data.message ||
        responseText ||
        'No response received'
      );
    } catch (error) {
      console.error('Error calling n8n webhook:', error);
      // In development, DON'T fallback to mock - let the error propagate to see what's wrong
      throw new Error('Failed to get response from AI service');
    }
  }
}
