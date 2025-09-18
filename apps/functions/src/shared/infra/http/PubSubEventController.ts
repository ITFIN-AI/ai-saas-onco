import { logger } from 'firebase-functions';
import { FunctionsErrorCode } from 'firebase-functions/lib/v1/providers/https';
import { BusinessEvent } from '@akademiasaas/shared';

export abstract class PubSubEventController<T = BusinessEvent> {
  protected abstract executeImpl(event: T, parsed?: boolean): Promise<any>;

  public async execute(event: T, parsed?: boolean): Promise<any> {
    try {
      return this.executeImpl(event, parsed);
    } catch (err) {
      logger.error('[PubSubEventController]: Uncaught controller error');
      logger.error(err);
      this.fail('An unexpected error occurred');
    }
  }

  public static errorResponse(code: FunctionsErrorCode, message: string) {
    logger.error(`Function ended with error ${code}: ${message}`);

    return;
  }

  public ok<T>(dto?: T) {
    logger.log('returning dto', dto);

    return {
      status: 'ok',
      data: dto || null,
    };
  }

  public created() {
    return { status: 'created' };
  }

  public clientError(message?: string) {
    return PubSubEventController.errorResponse('permission-denied', message || 'Unauthorized');
  }

  public unauthorized(message?: string) {
    return PubSubEventController.errorResponse('permission-denied', message || 'Unauthorized');
  }

  public invalid(message?: string) {
    return PubSubEventController.errorResponse('invalid-argument', message || 'Invalid argument');
  }

  public forbidden(message?: string) {
    return PubSubEventController.errorResponse('unavailable', message || 'Forbidden');
  }

  public notFound(message?: string) {
    return PubSubEventController.errorResponse('not-found', message || 'Not found');
  }

  public conflict(message?: string) {
    return PubSubEventController.errorResponse('already-exists', message || 'Conflict');
  }

  public tooMany(message?: string) {
    return PubSubEventController.errorResponse(
      'resource-exhausted',
      message || 'Too many requests'
    );
  }

  public todo(message?: string) {
    return PubSubEventController.errorResponse('unimplemented', `TODO: ${message}`);
  }

  public fail(error: Error | string, code?: FunctionsErrorCode) {
    if (typeof error === 'string') {
      logger.error(error);
    } else {
      logger.error(error, { error, code });
      logger.error(error.message);
    }

    return;
  }
}
