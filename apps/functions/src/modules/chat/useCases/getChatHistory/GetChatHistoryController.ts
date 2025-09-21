import { Request, Response } from 'express';
import { GetChatHistoryUseCase } from './GetChatHistoryUseCase';
import { GetChatHistoryError } from './GetChatHistoryErrors';
import { withErrorHandling } from '../../../../shared/withErrorHandling';

const getChatHistoryUseCase = new GetChatHistoryUseCase();

export const getChatHistoryController = withErrorHandling(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { email } = req.query;

  if (!sessionId || !email) {
    return res.status(400).json({
      error: GetChatHistoryError.INVALID_INPUT,
      message: 'Session ID and email are required',
    });
  }

  try {
    const session = await getChatHistoryUseCase.execute({
      sessionId,
      email: email as string,
    });

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('GetChatHistory controller error:', error);

    if (error instanceof Error) {
      switch (error.message) {
        case GetChatHistoryError.SESSION_NOT_FOUND:
          return res.status(404).json({
            error: GetChatHistoryError.SESSION_NOT_FOUND,
            message: 'Chat session not found',
          });
        case GetChatHistoryError.UNAUTHORIZED:
          return res.status(403).json({
            error: GetChatHistoryError.UNAUTHORIZED,
            message: 'Unauthorized access to chat session',
          });
        default:
          return res.status(500).json({
            error: 'INTERNAL_ERROR',
            message: 'Internal server error',
          });
      }
    }

    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
});
