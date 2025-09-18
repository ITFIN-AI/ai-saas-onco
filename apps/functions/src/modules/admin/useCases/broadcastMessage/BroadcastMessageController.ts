import { CloudFunctionController } from 'shared/infra/http/CloudFunctionController';
import { BroadcastMessageUseCase } from './BroadcastMessageUseCase';
import { AuthenticatedUser } from 'shared/core/AuthenticatedUser';
import { AppError } from 'shared/core/AppError';
import { BroadcastMessageErrors } from './BroadcastMessageErrors';
import { logger } from 'firebase-functions';
import { validator } from './BroadcastMessageDTOValidator';

export class BroadcastMessageController extends CloudFunctionController {
  constructor(private useCase: BroadcastMessageUseCase) {
    super();
  }

  protected async executeImpl(payload: unknown, user: AuthenticatedUser): Promise<any> {
    try {
      logger.debug(`Handling broadcast message payload ${JSON.stringify(payload)}`);
      const dto = validator(payload);
      const result = await this.useCase.execute(dto, user.uid);

      if (result.isLeft()) {
        throw result.value;
      } else {
        return this.ok(result.value.getValue());
      }
    } catch (err) {
      switch (err.constructor) {
        case BroadcastMessageErrors.NotAuthorized:
          return this.unauthorized(err.errorValue().message);
        case BroadcastMessageErrors.BroadcastFailed:
          return this.fail(err.errorValue().message);
        case AppError.UnexpectedError:
          return this.fail(err.errorValue().message);
        default:
          return this.fail(err.errorValue().message ?? err.message);
      }
    }
  }
}
