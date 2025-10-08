import { Request, Response } from 'express';
import { GetChatHistoryFromPostgresUseCase } from './GetChatHistoryFromPostgresUseCase';
import { GetChatHistoryFromPostgresDTOValidator } from './GetChatHistoryFromPostgresDTOValidator';
import { GetChatHistoryFromPostgresError } from './GetChatHistoryFromPostgresErrors';
import { withErrorHandling } from '../../../../shared/withErrorHandling';

const getChatHistoryFromPostgresUseCase = new GetChatHistoryFromPostgresUseCase();

export const getChatHistoryFromPostgresController = withErrorHandling(
  async (req: Request, res: Response) => {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        error: GetChatHistoryFromPostgresError.INVALID_INPUT,
        message: 'Email is required',
      });
    }

    const validationResult = GetChatHistoryFromPostgresDTOValidator.safeParse({ email });

    if (!validationResult.success) {
      return res.status(400).json({
        error: GetChatHistoryFromPostgresError.INVALID_INPUT,
        message: 'Invalid email address',
        details: validationResult.error.errors,
      });
    }

    try {
      const result = await getChatHistoryFromPostgresUseCase.execute(validationResult.data);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('GetChatHistoryFromPostgres controller error:', error);

      if (error instanceof Error) {
        switch (error.message) {
          case GetChatHistoryFromPostgresError.DATABASE_ERROR:
            return res.status(500).json({
              error: GetChatHistoryFromPostgresError.DATABASE_ERROR,
              message: 'Database error occurred',
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
  }
);
