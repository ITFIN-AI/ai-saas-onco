export class UnreachableCaseError extends Error {
  constructor(error: never) {
    super(`Unreachable case: ${JSON.stringify(error)}`);
  }
}
