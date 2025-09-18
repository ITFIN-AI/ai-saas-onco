interface IUseCaseError {
  message: string;
}

export abstract class UseCaseError implements IUseCaseError {
  public readonly message: string;

  constructor(message: string) {
    this.message = message;
  }
}

export abstract class UseCaseErrorWithDetails implements IUseCaseError {
  public readonly message: string;
  public readonly details: { [key: string]: string };

  constructor(message: string, details: { [key: string]: string }) {
    this.message = message;
    this.details = details;
  }
}
