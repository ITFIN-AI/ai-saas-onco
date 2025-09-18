import { ApiTokensRepository } from 'shared/domain/repositories/ApiTokensRepository';
import * as express from 'express';
import jwt from 'jsonwebtoken';
import { ApiUserToken } from 'shared/core/AuthenticatedUser';
import { logger } from 'firebase-functions';
import { ApiController, ApiRequest } from 'shared/infra/http/ApiController';

export const apiAuthorizer =
  (jwtPrivateKey: string, apiTokensRepository: ApiTokensRepository) =>
    async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ApiController.unauthorized(res);
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        return ApiController.unauthorized(res);
      }

      try {
        const decodedToken = jwt.verify(token, jwtPrivateKey) as ApiUserToken;
        const tokenDoc = await apiTokensRepository.findApiTokenById(
          decodedToken.sub,
          decodedToken.jti
        );

        if (!tokenDoc) {
          return ApiController.unauthorized(res);
        }

        (req as ApiRequest).auth = decodedToken as ApiUserToken;

        return next();
      } catch (err) {
        logger.error(err);

        return ApiController.unauthorized(res);
      }
    };

export const isAuthorizedApiRequest = (req: express.Request): req is ApiRequest =>
  (req as ApiRequest).auth !== undefined;
