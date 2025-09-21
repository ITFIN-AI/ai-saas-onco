import { z } from 'zod';
import { SendMessageDTO } from './SendMessageDTO';

export const SendMessageDTOValidator = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  email: z.string().email('Invalid email address'),
  sessionId: z.string().min(1, 'Session ID is required'),
});

export type SendMessageDTOValidationResult = z.infer<typeof SendMessageDTOValidator>;
