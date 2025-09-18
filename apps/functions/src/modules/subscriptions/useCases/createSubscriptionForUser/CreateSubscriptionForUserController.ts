import { logger } from 'firebase-functions';
import { CreateSubscriptionForUserUseCase } from './CreateSubscriptionForUserUseCase';
import { validator } from './CreateSubscriptionForUserDTOValidator';
import { CreateSubscriptionForUserErrors } from './CreateSubscriptionForUserErrors';
import { CloudFunctionWithoutAuthController } from 'shared/infra/http/CloudFunctionWithoutAuthController';

export class CreateSubscriptionForUserController extends CloudFunctionWithoutAuthController {
  constructor(private useCase: CreateSubscriptionForUserUseCase) {
    super();
  }

  async executeImpl(payload: unknown) {
    try {
      logger.debug(`Handling payload ${JSON.stringify(payload)}`);
      const dto = validator(payload);
      const result = await this.useCase.execute(dto);
      if (result.isLeft()) {
        throw result.value;
      } else {
        return this.ok(result.value.getValue());
      }
    } catch (err) {
      switch (err.constructor) {
        case CreateSubscriptionForUserErrors.DtoValidationError:
          return this.invalid(err.errorValue().message);
        case CreateSubscriptionForUserErrors.UnsupportedFeature:
          return this.todo(err.errorValue().message);
        default:
          return this.fail(err.errorValue?.().message ?? err.message);
      }
    }
  }
}
