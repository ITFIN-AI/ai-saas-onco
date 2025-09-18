import * as functions from 'firebase-functions';
import { UseCaseWithAuth } from 'shared/core/UseCase';
import { Either, Result, right, left } from 'shared/core/Result';
import { AppError } from 'shared/core/AppError';
import { CreateApiTokenDTO } from './CreateApiTokenDTO';
import { CreateApiTokenErrors } from './CreateApiTokenErrors';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { ApiUserToken } from 'shared/core/AuthenticatedUser';
import { ApiTokensRepository } from 'shared/domain/repositories/ApiTokensRepository';
import { UsersRepository } from 'shared/domain/repositories/UsersRepository';
import { USER_FEATURES } from '@akademiasaas/shared';

type Response = Either<
  AppError.UnexpectedError | CreateApiTokenErrors.UnsupportedFeature,
  Result<{ token: string }>
>;

type Dependencies = {
  logger: typeof functions.logger;
  issuer: string;
  audience: string;
  jwtPrivateKey: string;
  apiTokensRepository: ApiTokensRepository;
  usersRepository: UsersRepository;
};

export class CreateApiTokenUseCase
  implements UseCaseWithAuth<CreateApiTokenDTO, Promise<Response>> {
  constructor(private dependencies: Dependencies) { }

  async execute(dto: CreateApiTokenDTO, uid: string): Promise<Response> {
    const { logger, jwtPrivateKey, issuer, audience, apiTokensRepository } = this.dependencies;

    if (!(await this.apiFeatureEnabled(uid))) {
      return left(new CreateApiTokenErrors.UnsupportedFeature('api'));
    }

    const tokenId = uuid();

    const now = new Date();
    const iat = Math.floor(now.getTime() / 1000);
    const exp = this.getTokenExpiration(iat, dto.expiresIn);

    logger.debug('Generating api token', { ...dto, uid, iat, exp });

    const payload: ApiUserToken = {
      aud: audience,
      iss: issuer,
      sub: uid,
      jti: tokenId,
      iat,
      ...(exp ? { exp } : {}),
    };

    const token = jwt.sign(payload, jwtPrivateKey, {
      algorithm: 'HS256',
    });

    await apiTokensRepository.saveApiToken(uid, {
      id: payload.jti,
      name: dto.name,
      uid: payload.sub,
      expiresAt: exp ? new Date(exp * 1000) : null,
      createdAt: now,
      updatedAt: now,
    });

    return right(Result.ok({ token }));
  }

  async apiFeatureEnabled(uid: string) {
    const { usersRepository } = this.dependencies;
    if (!uid) {
      return false;
    }

    const user = await usersRepository.findUserById(uid);

    return (
      user &&
      (user.features?.includes(USER_FEATURES.API) ||
        user?.subscription?.plan.features.includes(USER_FEATURES.API))
    );
  }

  private getTokenExpiration(
    iat: number,
    expiresIn: CreateApiTokenDTO['expiresIn']
  ): number | null {
    return expiresIn ? iat + Number(expiresIn?.split('d')[0]) * 24 * 60 * 60 : null;
  }
}
