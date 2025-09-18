import { logger } from 'firebase-functions';
import * as express from 'express';
import {
  ApiResponse,
  ErrorResponsePayload,
  FailResponsePayload,
  SuccessResponsePayload,
} from 'shared/core/ApiResponse';
import { ApiUserToken } from 'shared/core/AuthenticatedUser';
import { isAuthorizedApiRequest } from 'shared/infra/http/middleware/apiAuthorizer';

export abstract class ApiController {
  protected abstract executeImpl(req: ApiRequest, res: express.Response): Promise<any>;

  public async execute(req: express.Request, res: express.Response): Promise<void> {
    if (!isAuthorizedApiRequest(req)) {
      return ApiController.unauthorized(res);
    }

    try {
      await this.executeImpl(req, res);
    } catch (err) {
      logger.error('[ApiController]: Uncaught controller error', { error: err });

      return ApiController.error(res, 500, 'An unexpected error occurred');
    }
  }

  static accepted<T extends object>(
    res: express.Response,
    dto?: SuccessResponsePayload<T>['data']
  ) {
    return ApiController.success(res, 202, dto);
  }

  static ok<T extends object>(res: express.Response, dto?: SuccessResponsePayload<T>['data']) {
    if (dto) {
      const json: SuccessResponsePayload<T> = {
        status: 'success',
        data: dto,
      };

      return ApiController.jsonResponse(res, 200, json);
    } else {
      return res.sendStatus(200);
    }
  }

  static badRequest(res: express.Response, details: FailResponsePayload['data']) {
    logger.debug('Returning 400 response', details);

    return ApiController.fail(res, 400, details);
  }

  static unauthorized(res: express.Response) {
    return ApiController.fail(res, 401, { message: 'Unauthorized' });
  }

  static notFound(res: express.Response) {
    return ApiController.fail(res, 404, { message: 'Not found' });
  }

  static tooManyRequests(res: express.Response) {
    return ApiController.fail(res, 429, { message: 'Too Many Requests' });
  }

  static success<T extends object>(
    res: express.Response,
    code: number,
    dto?: SuccessResponsePayload<T>['data']
  ) {
    if (dto) {
      const json: SuccessResponsePayload<T> = {
        status: 'success',
        data: dto,
      };

      return ApiController.jsonResponse(res, code, json);
    } else {
      return res.sendStatus(code);
    }
  }

  static fail(res: express.Response, code: number, data: FailResponsePayload['data']) {
    const json: FailResponsePayload = {
      status: 'fail',
      data,
    };

    return ApiController.jsonResponse(res, code, json);
  }

  static error(res: express.Response, code: number, message: string) {
    const json: ErrorResponsePayload = {
      status: 'error',
      message,
    };

    return ApiController.jsonResponse(res, code, json);
  }

  private static jsonResponse<T extends object>(
    res: express.Response,
    code: number,
    dto: ApiResponse<T>
  ) {
    res.status(code).json(dto);
  }
}

export interface ApiRequest extends express.Request {
  auth: ApiUserToken;
}
