import { logger } from 'firebase-functions';
import mapValues from 'lodash.mapvalues';

const wrapWithTryCatch =
  (fn: Function) =>
  (...args: unknown[]) =>
    Promise.resolve(fn(...args)).catch((e) => {
      logger.error('Error code:', e.code);
      logger.error('Error message:', e.message);
      logger.error('Error', e);

      return null;
    });

export const withErrorHandling = <T extends {}>(api: T): T => {
  // If it's a function, wrap it directly
  if (typeof api === 'function') {
    return wrapWithTryCatch(api) as T;
  }
  // If it's an object, use mapValues
  return mapValues(api, wrapWithTryCatch) as T;
};
