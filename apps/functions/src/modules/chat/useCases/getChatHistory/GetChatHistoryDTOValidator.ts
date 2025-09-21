import { z } from 'zod';
import { GetChatHistoryDTO } from './GetChatHistoryDTO';

export const GetChatHistoryDTOValidator = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  email: z.string().email('Invalid email address'),
});

export type GetChatHistoryDTOValidationResult = z.infer<typeof GetChatHistoryDTOValidator>;
