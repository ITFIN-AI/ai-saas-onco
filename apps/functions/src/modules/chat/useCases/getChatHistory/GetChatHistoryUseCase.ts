import { db } from '../../../../config/bootstrap';
import { GetChatHistoryDTO } from './GetChatHistoryDTO';
import { GetChatHistoryError } from './GetChatHistoryErrors';
import { ChatSessionDocument } from '@akademiasaas/shared';

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

    return session;
  }
}
