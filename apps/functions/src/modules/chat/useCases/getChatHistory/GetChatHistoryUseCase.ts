import { Timestamp } from 'firebase-admin/firestore';
import { ChatSessionDocument, ChatMessage } from '@akademiasaas/shared';
import { db } from '../../../../config/bootstrap';
import { GetChatHistoryDTO } from './GetChatHistoryDTO';
import { GetChatHistoryError } from './GetChatHistoryErrors';

export class GetChatHistoryUseCase {
  async execute(dto: GetChatHistoryDTO): Promise<ChatSessionDocument> {
    const sessionRef = db.collection('chatSessions').doc(dto.sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      throw new Error(GetChatHistoryError.SESSION_NOT_FOUND);
    }

    const session = sessionDoc.data() as ChatSessionDocument;

    // Verify email matches session email
    if (session.email !== dto.email) {
      throw new Error(GetChatHistoryError.UNAUTHORIZED);
    }

    return this.normalizeSession(session);
  }

  private normalizeSession(session: ChatSessionDocument): ChatSessionDocument {
    const normalizeDate = <T>(value: T): T => {
      if (value instanceof Timestamp) {
        return value.toDate() as T;
      }

      if (value instanceof Date) {
        return value;
      }

      if (typeof value === 'string' || typeof value === 'number') {
        return new Date(value) as T;
      }

      return value;
    };

    const normalizeMessage = (message: ChatMessage): ChatMessage => ({
      ...message,
      timestamp: normalizeDate(message.timestamp),
    });

    return {
      ...session,
      createdAt: normalizeDate(session.createdAt),
      updatedAt: normalizeDate(session.updatedAt),
      messages: session.messages?.map(normalizeMessage) ?? [],
      metadata: session.metadata
        ? {
            ...session.metadata,
            lastActivity: session.metadata.lastActivity
              ? normalizeDate(session.metadata.lastActivity)
              : session.metadata.lastActivity,
          }
        : undefined,
    };
  }
}
