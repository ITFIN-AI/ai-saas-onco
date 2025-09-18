import { CloudFunctionController } from '../../../../shared/infra/http/CloudFunctionController';
import { AuthenticatedUser } from '../../../../shared/core/AuthenticatedUser';
import { CreateBillingCustomerPortalUseCase } from './CreateBillingCustomerPortalUseCase';
import { validateCustomerBillingDTO } from './CreateBillingCustomerPortalDTOValidator';
import { CreateBillingCustomerPortalErrors } from './CreateBillingCustomerPortalErrors';

export class CreateBillingCustomerPortalController extends CloudFunctionController {
  constructor(private useCase: CreateBillingCustomerPortalUseCase) {
    super();
  }

  async executeImpl(_payload: unknown, user: AuthenticatedUser) {
    try {
      const dto = validateCustomerBillingDTO({
        email: user.token.email,
        uid: user.uid,
      });
      const result = await this.useCase.execute(dto);
      if (result.isLeft()) {
        const error = result.value;

        return this.fail(error.errorValue().message);
      } else {
        return this.ok(result.value.getValue().session);
      }
    } catch (err) {
      switch (err.constructor) {
        case CreateBillingCustomerPortalErrors.UserNotFound:
          return this.notFound(err.errorValue().message);
        default:
          return this.fail(err.errorValue?.().message || err.message);
      }
    }
  }
}
