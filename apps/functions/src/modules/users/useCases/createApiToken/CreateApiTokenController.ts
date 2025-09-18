import { logger } from 'firebase-functions';
import { CloudFunctionController } from 'shared/infra/http/CloudFunctionController';
import { AuthenticatedUser } from 'shared/core/AuthenticatedUser';
import { CreateApiTokenUseCase } from './CreateApiTokenUseCase';
import { validator } from './CreateApiTokenDTOValidator';
import { CreateApiTokenErrors } from './CreateApiTokenErrors';

export class CreateApiTokenController extends CloudFunctionController {
  constructor(private useCase: CreateApiTokenUseCase) {
    super();
  }

  async executeImpl(payload: unknown, user: AuthenticatedUser) {
    try {
      logger.debug(`Handling payload ${JSON.stringify(payload)}`);
      const dto = validator(payload);
      const result = await this.useCase.execute(dto, user.uid);
      if (result.isLeft()) {
        throw result.value;
      } else {
        return this.ok(result.value.getValue());
      }
    } catch (err) {
      switch (err.constructor) {
        case CreateApiTokenErrors.DtoValidationError:
          return this.invalid(err.errorValue().message);
        case CreateApiTokenErrors.UnsupportedFeature:
          return this.todo(err.errorValue().message);
        default:
          return this.fail(err.errorValue?.().message ?? err.message);
      }
    }
  }
}
