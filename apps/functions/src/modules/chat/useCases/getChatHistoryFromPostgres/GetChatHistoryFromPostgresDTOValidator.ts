import { z } from 'zod';
import { GetChatHistoryFromPostgresDTO } from './GetChatHistoryFromPostgresDTO';

export const GetChatHistoryFromPostgresDTOValidator = z.object({
  email: z.string().email('Invalid email address'),
});

export type GetChatHistoryFromPostgresDTOValidationResult = z.infer<
  typeof GetChatHistoryFromPostgresDTOValidator
>;
