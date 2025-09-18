import { logger } from 'firebase-functions';
import { CloudFunctionController } from 'shared/infra/http/CloudFunctionController';
import { AuthenticatedUser } from 'shared/core/AuthenticatedUser';
import { DeleteApiTokenUseCase } from './DeleteApiTokenUseCase';
import { validator } from './DeleteApiTokenDTOValidator';
import { DeleteApiTokenErrors } from './DeleteApiTokenErrors';

export class DeleteApiTokenController extends CloudFunctionController {
  constructor(private useCase: DeleteApiTokenUseCase) {
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
        case DeleteApiTokenErrors.DtoValidationError:
          return this.invalid(err.errorValue().message);
        case DeleteApiTokenErrors.UnsupportedFeature:
          return this.todo(err.errorValue().message);
        default:
          return this.fail(err.errorValue?.().message ?? err.message);
      }
    }
  }
}
