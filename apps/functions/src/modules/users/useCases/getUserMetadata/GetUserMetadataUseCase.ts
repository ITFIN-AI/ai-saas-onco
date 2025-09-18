import { UseCaseWithAuth } from 'shared/core/UseCase';
import { Either, Result, right } from 'shared/core/Result';
import { AppError } from 'shared/core/AppError';
import { GetUserMetadataDTO } from './GetUserMetadataDTO';
import * as functions from 'firebase-functions';

type Response = Either<
  AppError.UnexpectedError,
  Result<{
    country?: string;
  }>
>;

interface Dependencies {
  logger: typeof functions.logger;
}

export class GetUserMetadataUseCase
  implements UseCaseWithAuth<GetUserMetadataDTO, Promise<Response>>
{
  constructor(private dependencies: Dependencies) {}

  async execute(metadata: GetUserMetadataDTO): Promise<Response> {
    const { logger } = this.dependencies;

    if (!metadata.country) {
      // this is ok for running locally on emulator, but should not happen in firebase
      logger.error('Missing country in resolved user metadata', { metadata });
    }

    return right(Result.ok(metadata));
  }
}
