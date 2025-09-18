import * as functions from 'firebase-functions';
import { UseCase } from 'shared/core/UseCase';
import { Either, left, Result, right } from 'shared/core/Result';
import { AppError } from 'shared/core/AppError';
import { AdminHandlerDTO } from './AdminHandlerDTO';
import { AdminHandlerErrors } from './AdminHandlerErrors';
import { AdminOperationType } from 'shared/enums/AdminOperationType';
import { AuthService } from 'shared/services/AuthService';

type Response = Either<
  AppError.UnexpectedError | AdminHandlerErrors.UnsupportedFeature,
  Result<{ status: string }>
>;

type Dependencies = {
  logger: typeof functions.logger;
  authService: AuthService;
};

export class AdminHandlerUseCase implements UseCase<AdminHandlerDTO, Promise<Response>> {
  constructor(private dependencies: Dependencies) {}

  async execute(dto: AdminHandlerDTO): Promise<Response> {
    const { logger, authService } = this.dependencies;
    if (dto.type === AdminOperationType.ChangePassword) {
      logger.debug(`Start updating password for user ${dto.uid}`);

      await authService.updatePassword(dto.uid, dto.newPassword);

      logger.info('Successfully updated password');

      return right(Result.ok({ status: 'ok' }));
    }

    if (dto.type === AdminOperationType.AddAdminRole) {
      logger.debug(`Start adding admin role for user ${dto.uid}`);

      await authService.addSystemRole(dto.uid, 'admin');

      logger.info('Successfully added admin role');

      return right(Result.ok({ status: 'ok' }));
    }

    return left(new AdminHandlerErrors.UnsupportedFeature(dto));
  }
}
