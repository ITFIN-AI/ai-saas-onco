import { https, logger } from 'firebase-functions';
import { GetUserMetadataUseCase } from './GetUserMetadataUseCase';
import { validator } from './GetUserMetadataDTOValidator';
import { GetUserMetadataErrors } from './GetUserMetadataErrors';
import { CloudFunctionWithoutAuthController } from 'shared/infra/http/CloudFunctionWithoutAuthController';

export class GetUserMetadataController extends CloudFunctionWithoutAuthController {
  constructor(private useCase: GetUserMetadataUseCase) {
    super();
  }

  async executeImpl(_payload: unknown, context?: https.CallableContext) {
    try {
      const headers = context?.rawRequest.headers;
      logger.debug(`Handling get user metadata request`, headers);

      if (!headers) {
        throw new GetUserMetadataErrors.BadRequestError('Missing http headers');
      }

      const dto = validator({
        country: headers['x-appengine-country'],
      });
      const result = await this.useCase.execute(dto);
      if (result.isLeft()) {
        throw result.value;
      } else {
        return this.ok(result.value.getValue());
      }
    } catch (err) {
      switch (err.constructor) {
        case GetUserMetadataErrors.DtoValidationError:
        case GetUserMetadataErrors.BadRequestError:
          return this.invalid(err.errorValue().message);
        default:
          return this.fail(err.errorValue?.().message ?? err.message);
      }
    }
  }
}
