import * as functions from 'firebase-functions';
import { UseCaseWithAuth } from 'shared/core/UseCase';
import { Either, left, Result, right } from 'shared/core/Result';
import { AppError } from 'shared/core/AppError';
import { SendResetPasswordEmailDTO } from './SendResetPasswordEmailDTO';
import { SendResetPasswordEmailErrors } from './SendResetPasswordEmailErrors';
import { UsersRepository } from 'shared/domain/repositories/UsersRepository';
import { AuthService } from 'shared/services/AuthService';
import { EmailService } from 'shared/services/EmailService';

type Response = Either<
  AppError.UnexpectedError | SendResetPasswordEmailErrors.FailedToGenerateResetPasswordCode,
  Result<{ status: string }>
>;

type Dependencies = {
  logger: typeof functions.logger;
  usersRepository: UsersRepository;
  authService: AuthService;
  mailer: EmailService;
  resetPasswordEmailTemplate: string;
  appHost: string;
};

export class SendResetPasswordEmailUseCase
  implements UseCaseWithAuth<SendResetPasswordEmailDTO, Promise<Response>>
{
  constructor(private dependencies: Dependencies) {}

  async execute(dto: SendResetPasswordEmailDTO): Promise<Response> {
    const { logger, authService, mailer, resetPasswordEmailTemplate, usersRepository, appHost } =
      this.dependencies;

    const user = await usersRepository.findUserByEmail(dto.email);

    if (!user) {
      logger.warn(`User with email ${dto.email} does not exist`);

      // We don't want to reveal that user with this email does not exist.
      return right(Result.ok({ status: 'ok' }));
    }

    const firebaseResetPasswordLink = await authService.createResetPasswordLink(
      dto.email,
      dto.continueUrl
    );
    const firebaseResetPasswordUrl = new URL(firebaseResetPasswordLink);
    const oobCode = firebaseResetPasswordUrl.searchParams.get('oobCode');

    if (!oobCode) {
      return left(new SendResetPasswordEmailErrors.FailedToGenerateResetPasswordCode(dto.email));
    }

    const resetPasswordUrl = new URL(dto.continueUrl || appHost);
    resetPasswordUrl.pathname = '/auth/reset-password';
    resetPasswordUrl.searchParams.set('code', oobCode);
    if (dto.continueUrl) {
      resetPasswordUrl.searchParams.set('continueUrl', dto.continueUrl);
    }

    await mailer.sendEmail({
      email: dto.email,
      dynamicTemplateData: {
        link: resetPasswordUrl.toString(),
        en: (dto.lang ? dto.lang === 'en' : undefined) || user.lang === 'en',
      },
      templateAlias: resetPasswordEmailTemplate,
    });
    logger.info('Reset password link sent');

    return right(Result.ok({ status: 'ok' }));
  }
}
