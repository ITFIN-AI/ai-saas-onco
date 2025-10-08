import { postgresPool } from '../../../../config/bootstrap';
import { GetChatHistoryFromPostgresDTO } from './GetChatHistoryFromPostgresDTO';
import { GetChatHistoryFromPostgresError } from './GetChatHistoryFromPostgresErrors';
import { ChatHistoryDocument, ChatHistorySession } from '@akademiasaas/shared';

export class GetChatHistoryFromPostgresUseCase {
  async execute(dto: GetChatHistoryFromPostgresDTO): Promise<ChatHistoryDocument> {
    try {
      // Query to get chat sessions for the given email
      const sessionsQuery = `
        SELECT 
          s.id,
          s.email,
          s.session_id,
          s.status,
          s.created_at,
          s.updated_at,
          s.last_activity,
          COUNT(m.id) as message_count,
          (
            SELECT content 
            FROM chat_messages 
            WHERE session_id = s.session_id 
            ORDER BY timestamp ASC 
            LIMIT 1
          ) as first_message
        FROM chat_sessions s
        LEFT JOIN chat_messages m ON s.session_id = m.session_id
        WHERE s.email = $1
        GROUP BY s.id, s.email, s.session_id, s.status, s.created_at, s.updated_at, s.last_activity
        ORDER BY s.last_activity DESC
        LIMIT 50
      `;

      const result = await postgresPool.query(sessionsQuery, [dto.email]);

      const sessions: ChatHistorySession[] = result.rows.map((row) => ({
        id: row.id,
        email: row.email,
        session_id: row.session_id,
        status: row.status,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
        last_activity: new Date(row.last_activity),
        message_count: parseInt(row.message_count) || 0,
        first_message: row.first_message || undefined,
      }));

      return {
        sessions,
        totalSessions: sessions.length,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('GetChatHistoryFromPostgresUseCase error:', error);
      throw new Error(GetChatHistoryFromPostgresError.DATABASE_ERROR);
    }
  }
}
