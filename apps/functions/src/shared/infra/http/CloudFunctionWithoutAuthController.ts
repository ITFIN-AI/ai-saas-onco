import { logger, https } from 'firebase-functions';
import { FunctionsErrorCode } from 'firebase-functions/lib/v1/providers/https';

export abstract class CloudFunctionWithoutAuthController {
  protected abstract executeImpl(dto: any, context?: https.CallableContext): Promise<any>;

  public async execute(dto: any, context?: https.CallableContext): Promise<any> {
    try {
      return this.executeImpl(dto, context);
    } catch (err) {
      logger.error('[CloudFunctionWithoutAuthController]: Uncaught controller error', { context });
      logger.error(err);
      this.fail('An unexpected error occurred');
    }
  }

  public static errorResponse(code: FunctionsErrorCode, message: string) {
    logger.error(`Function ended with error ${code}: ${message}`);
    throw new https.HttpsError(code, message);
  }

  public ok<T>(dto?: T) {
    logger.debug('Returning dto', dto);

    return {
      status: 'ok',
      body: dto || null,
    };
  }

  public created() {
    return { status: 'created' };
  }

  public clientError(message?: string) {
    return CloudFunctionWithoutAuthController.errorResponse(
      'permission-denied',
      message || 'Unauthorized'
    );
  }

  public unauthorized(message?: string) {
    return CloudFunctionWithoutAuthController.errorResponse(
      'permission-denied',
      message || 'Unauthorized'
    );
  }

  public invalid(message?: string) {
    return CloudFunctionWithoutAuthController.errorResponse(
      'invalid-argument',
      message || 'Invalid argument'
    );
  }

  public forbidden(message?: string) {
    return CloudFunctionWithoutAuthController.errorResponse('unavailable', message || 'Forbidden');
  }

  public notFound(message?: string) {
    return CloudFunctionWithoutAuthController.errorResponse('not-found', message || 'Not found');
  }

  public conflict(message?: string) {
    return CloudFunctionWithoutAuthController.errorResponse(
      'already-exists',
      message || 'Conflict'
    );
  }

  public tooMany(message?: string) {
    return CloudFunctionWithoutAuthController.errorResponse(
      'resource-exhausted',
      message || 'Too many requests'
    );
  }

  public todo(message?: string) {
    return CloudFunctionWithoutAuthController.errorResponse(
      'unimplemented',
      message || 'Feature is not already implemented'
    );
  }

  public fail(error: Error | string, code?: FunctionsErrorCode) {
    logger.error(error);
    throw new https.HttpsError(
      code || 'internal',
      typeof error === 'string' ? error : (error?.message ?? 'Internal Error')
    );
  }
}
