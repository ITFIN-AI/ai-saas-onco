import { logger } from 'firebase-functions';
import { AdminHandlerUseCase } from './AdminHandlerUseCase';
import { validator } from './AdminHandlerDTOValidator';
import { AdminHandlerErrors } from './AdminHandlerErrors';
import { PubSubEventController } from 'shared/infra/http/PubSubEventController';

export class AdminHandlerController extends PubSubEventController<object> {
  constructor(private useCase: AdminHandlerUseCase) {
    super();
  }

  async executeImpl(payload: unknown) {
    try {
      logger.debug(`Handling new payload`);
      const dto = validator(payload);
      const result = await this.useCase.execute(dto);
      if (result.isLeft()) {
        throw result.value;
      } else {
        return this.ok(result.value.getValue());
      }
    } catch (err) {
      switch (err.constructor) {
        case AdminHandlerErrors.DtoValidationError:
          return this.invalid(err.errorValue().message);
        case AdminHandlerErrors.UnsupportedFeature:
          return this.todo(err.errorValue().message);
        default:
          return this.fail(err.errorValue?.().message ?? err.message);
      }
    }
  }
}
