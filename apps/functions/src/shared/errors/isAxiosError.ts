import { AxiosError } from 'axios';

export const isAxiosError = <T extends object>(
  unknownError: unknown
): unknownError is AxiosError<T> =>
  Boolean(unknownError && typeof unknownError === 'object' && 'isAxiosError' in unknownError);
