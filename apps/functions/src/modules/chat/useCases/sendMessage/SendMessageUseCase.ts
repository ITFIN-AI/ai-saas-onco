import { v4 as uuidv4 } from 'uuid';
import { db, postgresPool } from '../../../../config/bootstrap';
import { FieldValue } from 'firebase-admin/firestore';
import { SendMessageDTO } from './SendMessageDTO';
import { SendMessageError } from './SendMessageErrors';
import { ChatSessionDocument, ChatMessage } from '@akademiasaas/shared';

export class SendMessageUseCase {
  private readonly N8N_WEBHOOK_URL = 'https://aiforyou.agency/webhook/87d0712c-9ce3-4f5d-a715-8a1f5f1574c6/chat';

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
        await client.query(`
          INSERT INTO chat_sessions (session_id, email, status, created_at, updated_at, last_activity)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (session_id) 
          DO UPDATE SET 
            updated_at = $5,
            last_activity = $6
        `, [sessionId, email, 'active', new Date(), new Date(), new Date()]);
        
        // Insert user message
        await client.query(`
          INSERT INTO chat_messages (id, session_id, content, role, timestamp)
          VALUES ($1, $2, $3, $4, $5)
        `, [userMessage.id, sessionId, userMessage.content, userMessage.role, userMessage.timestamp]);
        
        // Insert AI message
        await client.query(`
          INSERT INTO chat_messages (id, session_id, content, role, timestamp)
          VALUES ($1, $2, $3, $4, $5)
        `, [aiMessage.id, sessionId, aiMessage.content, aiMessage.role, aiMessage.timestamp]);
        
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
    try {
      const response = await fetch(this.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response || data.message || 'No response received';
    } catch (error) {
      console.error('Error calling n8n webhook:', error);
      throw new Error('Failed to get response from AI service');
    }
  }
}
