import { logger } from 'firebase-functions';
import { FunctionsErrorCode } from 'firebase-functions/lib/v1/providers/https';
import Stripe from 'stripe';

export abstract class StripeEventController {
  protected abstract executeImpl(event: Stripe.Event): Promise<any>;

  public async execute(event: Stripe.Event): Promise<any> {
    try {
      return this.executeImpl(event);
    } catch (err) {
      logger.error('[CloudFunctionController]: Uncaught controller error');
      logger.error(err);
      this.fail('An unexpected error occurred');
    }
  }

  public static errorResponse(code: FunctionsErrorCode, message: string) {
    logger.error(`Function ended with error ${code}: ${message}`);

    return;
  }

  public ok<T>(dto?: T) {
    logger.debug('Returning dto', dto);

    return {
      status: 'ok',
      data: dto || null,
    };
  }

  public warn<T>(dto?: T) {
    logger.warn('Returning dto', dto);

    return {
      status: 'ok',
      data: dto || null,
    };
  }

  public created() {
    return { status: 'created' };
  }

  public clientError(message?: string) {
    return StripeEventController.errorResponse('permission-denied', message || 'Unauthorized');
  }

  public unauthorized(message?: string) {
    return StripeEventController.errorResponse('permission-denied', message || 'Unauthorized');
  }

  public invalid(message?: string) {
    return StripeEventController.errorResponse('invalid-argument', message || 'Invalid argument');
  }

  public forbidden(message?: string) {
    return StripeEventController.errorResponse('unavailable', message || 'Forbidden');
  }

  public notFound(message?: string) {
    return StripeEventController.errorResponse('not-found', message || 'Not found');
  }

  public conflict(message?: string) {
    return StripeEventController.errorResponse('already-exists', message || 'Conflict');
  }

  public tooMany(message?: string) {
    return StripeEventController.errorResponse(
      'resource-exhausted',
      message || 'Too many requests'
    );
  }

  public todo() {
    return StripeEventController.errorResponse('unimplemented', 'TODO');
  }

  public fail(error: Error | string, _?: FunctionsErrorCode) {
    logger.error(error);

    return;
  }
}
