import { logger } from 'firebase-functions';
import { FunctionsErrorCode } from 'firebase-functions/lib/v1/providers/https';
import { z } from 'zod';

export const payUEventSchema = z.object({
  order: z.union([
    z.object({
      orderId: z.string(),
      extOrderId: z.string(),
      status: z.literal('COMPLETED'),
      totalAmount: z.coerce.number(),
      payMethod: z.object({
        type: z.string(),
      }),
    }),
    z.object({
      orderId: z.string(),
      extOrderId: z.string(),
      status: z.enum(['PENDING', 'CANCELED', 'WAITING_FOR_CONFIRMATION']),
    }),
  ]),
});

export type PayUEvent = z.infer<typeof payUEventSchema>;

export type PayUPayload = {
  ownerId: string;
  productId: string;
  event: PayUEvent;
};

export abstract class PayUEventController {
  protected abstract executeImpl(payload: PayUPayload): Promise<any>;

  public async execute(payload: PayUPayload): Promise<any> {
    try {
      return this.executeImpl(payload);
    } catch (err) {
      logger.error('[PayUEventController]: Uncaught controller error');
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
    return PayUEventController.errorResponse('permission-denied', message || 'Unauthorized');
  }

  public unauthorized(message?: string) {
    return PayUEventController.errorResponse('permission-denied', message || 'Unauthorized');
  }

  public invalid(message?: string) {
    return PayUEventController.errorResponse('invalid-argument', message || 'Invalid argument');
  }

  public forbidden(message?: string) {
    return PayUEventController.errorResponse('unavailable', message || 'Forbidden');
  }

  public notFound(message?: string) {
    return PayUEventController.errorResponse('not-found', message || 'Not found');
  }

  public conflict(message?: string) {
    return PayUEventController.errorResponse('already-exists', message || 'Conflict');
  }

  public tooMany(message?: string) {
    return PayUEventController.errorResponse('resource-exhausted', message || 'Too many requests');
  }

  public todo(message?: string) {
    return PayUEventController.errorResponse('unimplemented', `TODO: ${message}`);
  }

  public fail(error: Error | string, _?: FunctionsErrorCode) {
    logger.error(error);

    return;
  }
}
