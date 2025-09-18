import * as functions from 'firebase-functions';
import { UseCaseWithAuth } from 'shared/core/UseCase';
import { Either, left, Result, right } from 'shared/core/Result';
import { AppError } from 'shared/core/AppError';
import { BroadcastMessageDTO } from './BroadcastMessageDTO';
import { BroadcastMessageErrors } from './BroadcastMessageErrors';
import { BroadcastService } from 'shared/services/BroadcastService';
import { AuthService } from 'shared/services/AuthService';

type Response = Either<
  | AppError.UnexpectedError
  | BroadcastMessageErrors.NotAuthorized
  | BroadcastMessageErrors.BroadcastFailed,
  Result<{ status: string }>
>;

type Dependencies = {
  logger: typeof functions.logger;
  broadcastService: BroadcastService;
  authService: AuthService;
};

export class BroadcastMessageUseCase
  implements UseCaseWithAuth<BroadcastMessageDTO, Promise<Response>>
{
  constructor(private dependencies: Dependencies) {}

  async execute(dto: BroadcastMessageDTO, uid: string): Promise<Response> {
    const { logger, broadcastService, authService } = this.dependencies;

    try {
      // Check if user is admin
      const isAdmin = await authService.isSystemAdmin(uid);
      if (!isAdmin) {
        return left(new BroadcastMessageErrors.NotAuthorized());
      }

      logger.debug(`Starting broadcast message from admin ${uid}`, { dto });

      await broadcastService.broadcastAnnouncement(dto.title, dto.message, {
        url: dto.url,
        emojiIcon: dto.emojiIcon,
        targetUserIds: dto.targetUserIds,
      });

      logger.info('Successfully sent broadcast message');

      return right(Result.ok({ status: 'ok' }));
    } catch (error) {
      logger.error('Failed to send broadcast message', error);

      return left(new BroadcastMessageErrors.BroadcastFailed(error.message));
    }
  }
}
