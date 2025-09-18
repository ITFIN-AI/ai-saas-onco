import { logger } from 'firebase-functions';
import { SendResetPasswordEmailUseCase } from './SendResetPasswordEmailUseCase';
import { validator } from './SendResetPasswordEmailDTOValidator';
import { SendResetPasswordEmailErrors } from './SendResetPasswordEmailErrors';
import { CloudFunctionWithoutAuthController } from 'shared/infra/http/CloudFunctionWithoutAuthController';

export class SendResetPasswordEmailController extends CloudFunctionWithoutAuthController {
  constructor(private useCase: SendResetPasswordEmailUseCase) {
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
        case SendResetPasswordEmailErrors.DtoValidationError:
        case SendResetPasswordEmailErrors.FailedToGenerateResetPasswordCode:
          return this.invalid(err.errorValue().message);
        default:
          return this.fail(err.errorValue?.().message ?? err.message);
      }
    }
  }
}
