import { logger } from 'firebase-functions';
import { CloudFunctionController } from 'shared/infra/http/CloudFunctionController';
import { AuthenticatedUser } from 'shared/core/AuthenticatedUser';
import { UpdateCustomerDataUseCase } from './UpdateCustomerDataUseCase';
import { UpdateCustomerDataErrors } from './UpdateCustomerDataErrors';
import { UpdateCustomerDataDTO } from './UpdateCustomerDataDTO';

export class UpdateCustomerDataController extends CloudFunctionController {
  constructor(private useCase: UpdateCustomerDataUseCase) {
    super();
  }

  async executeImpl(payload: unknown, user: AuthenticatedUser) {
    try {
      logger.debug(`Handling payload ${JSON.stringify(payload)}`);
      const result = await this.useCase.execute(payload as UpdateCustomerDataDTO, user.uid);
      if (result.isLeft()) {
        throw result.value;
      } else {
        return this.ok(result.value.getValue());
      }
    } catch (err) {
      switch (err.constructor) {
        case UpdateCustomerDataErrors.DtoValidationError:
          return this.invalid(err.errorValue().message);
        case UpdateCustomerDataErrors.UnsupportedFeature:
          return this.todo(err.errorValue().message);
        default:
          return this.fail(err.errorValue?.().message ?? err.message);
      }
    }
  }
}
