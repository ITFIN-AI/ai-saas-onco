import * as functions from 'firebase-functions';
import { UseCaseWithAuth } from 'shared/core/UseCase';
import { Either, Result, right, left } from 'shared/core/Result';
import { AppError } from 'shared/core/AppError';
import { DeleteApiTokenDTO } from './DeleteApiTokenDTO';
import { DeleteApiTokenErrors } from './DeleteApiTokenErrors';
import { ApiTokensRepository } from 'shared/domain/repositories/ApiTokensRepository';

type Response = Either<
  AppError.UnexpectedError | DeleteApiTokenErrors.UnsupportedFeature,
  Result<{ status: string }>
>;

type Dependencies = {
  logger: typeof functions.logger;
  apiTokensRepository: ApiTokensRepository;
};

export class DeleteApiTokenUseCase
  implements UseCaseWithAuth<DeleteApiTokenDTO, Promise<Response>>
{
  constructor(private dependencies: Dependencies) {}

  async execute(dto: DeleteApiTokenDTO, uid: string): Promise<Response> {
    if (!uid) {
      return left(new DeleteApiTokenErrors.UnsupportedFeature(uid));
    }

    const { logger, apiTokensRepository } = this.dependencies;

    await apiTokensRepository.deleteApiToken(uid, dto.id);
    logger.info('Api token deleted', { uid, tokenId: dto.id });

    return right(Result.ok({ status: 'ok' }));
  }
}
