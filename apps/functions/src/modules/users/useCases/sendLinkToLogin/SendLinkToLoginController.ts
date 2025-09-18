import { logger } from 'firebase-functions';
import { SendLinkToLoginUseCase } from './SendLinkToLoginUseCase';
import { validator } from './SendLinkToLoginDTOValidator';
import { SendLinkToLoginErrors } from './SendLinkToLoginErrors';
import { CloudFunctionWithoutAuthController } from 'shared/infra/http/CloudFunctionWithoutAuthController';

export class SendLinkToLoginController extends CloudFunctionWithoutAuthController {
  constructor(private useCase: SendLinkToLoginUseCase) {
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
        case SendLinkToLoginErrors.DtoValidationError:
          return this.invalid(err.errorValue().message);
        case SendLinkToLoginErrors.UnsupportedFeature:
          return this.todo(err.errorValue().message);
        case SendLinkToLoginErrors.UserIsNotPermittedToGetALink:
          return this.forbidden(err.errorValue().message);
        default:
          return this.fail(err.errorValue?.().message ?? err.message);
      }
    }
  }
}
