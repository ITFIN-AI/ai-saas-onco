import { Request, Response } from 'express';
import { SendMessageUseCase } from './SendMessageUseCase';
import { SendMessageDTOValidator } from './SendMessageDTOValidator';
import { SendMessageError } from './SendMessageErrors';
import { withErrorHandling } from '../../../../shared/withErrorHandling';

const sendMessageUseCase = new SendMessageUseCase();

export const sendMessageController = withErrorHandling(async (req: Request, res: Response) => {
  const validationResult = SendMessageDTOValidator.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      error: SendMessageError.INVALID_INPUT,
      message: 'Invalid input data',
      details: validationResult.error.errors,
    });
  }

  try {
    const result = await sendMessageUseCase.execute(validationResult.data);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('SendMessage controller error:', error);

    res.status(500).json({
      error: SendMessageError.CHAT_SERVICE_ERROR,
      message: 'Failed to send message',
    });
  }
});
