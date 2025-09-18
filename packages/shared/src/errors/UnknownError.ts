class UnknownError extends Error {
  public originalError: unknown;
  public static message = 'UnknownError';

  constructor(originalError: unknown, ...params: any) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnknownError);
    }
    this.name = 'UnknownError';
    this.originalError = originalError;
    this.message = UnknownError.message;
  }
}

export default UnknownError;
