import { logger, https } from 'firebase-functions';
import { AuthenticatedUser } from '../../core/AuthenticatedUser';
import { FunctionsErrorCode } from 'firebase-functions/lib/v1/providers/https';

export abstract class CloudFunctionController {
  protected abstract executeImpl(dto: any, user: AuthenticatedUser): Promise<any>;

  public async execute(dto: any, context: https.CallableContext): Promise<any> {
    if (!context.auth) {
      this.unauthorized('The function must be called while authenticated.');

      return;
    }
    try {
      return this.executeImpl(dto, context.auth);
    } catch (err) {
      logger.error('[CloudFunctionController]: Uncaught controller error');
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
    return CloudFunctionController.errorResponse('permission-denied', message || 'Unauthorized');
  }

  public unauthorized(message?: string) {
    return CloudFunctionController.errorResponse('permission-denied', message || 'Unauthorized');
  }

  public invalid(message?: string) {
    return CloudFunctionController.errorResponse('invalid-argument', message || 'Invalid argument');
  }

  public forbidden(message?: string) {
    return CloudFunctionController.errorResponse('unavailable', message || 'Forbidden');
  }

  public notFound(message?: string) {
    return CloudFunctionController.errorResponse('not-found', message || 'Not found');
  }

  public conflict(message?: string) {
    return CloudFunctionController.errorResponse('already-exists', message || 'Conflict');
  }

  public tooMany(message?: string) {
    return CloudFunctionController.errorResponse(
      'resource-exhausted',
      message || 'Too many requests'
    );
  }

  public todo(message?: string) {
    return CloudFunctionController.errorResponse(
      'unimplemented',
      message || 'Feature is not already implemented'
    );
  }

  public fail(error: Error | string, code?: FunctionsErrorCode) {
    logger.error(error, { parsed: JSON.stringify(error) });
    throw new https.HttpsError(
      code || 'internal',
      typeof error === 'string' ? error : (error?.message ?? 'Internal Error')
    );
  }
}
