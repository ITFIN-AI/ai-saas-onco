import * as functions from 'firebase-functions';
import { UseCase } from 'shared/core/UseCase';
import { Either, Result, right } from 'shared/core/Result';
import { AppError } from 'shared/core/AppError';
import { SendLinkToLoginDTO } from './SendLinkToLoginDTO';
import { SendLinkToLoginErrors } from './SendLinkToLoginErrors';
import { UsersRepository } from 'shared/domain/repositories/UsersRepository';
import { AuthService } from 'shared/services/AuthService';
import { EmailService } from 'shared/services/EmailService';
import { UserDocument } from '@akademiasaas/shared';

type Response = Either<
  AppError.UnexpectedError | SendLinkToLoginErrors.UnsupportedFeature,
  Result<{ status: string }>
>;

type Dependencies = {
  logger: typeof functions.logger;
  usersRepository: UsersRepository;
  authService: AuthService;
  mailer: EmailService;
  applicationLoginEmailTemplate: string;
};

export class SendLinkToLoginUseCase implements UseCase<SendLinkToLoginDTO, Promise<Response>> {
  constructor(private dependencies: Dependencies) {}

  async execute(dto: SendLinkToLoginDTO): Promise<Response> {
    const { logger, authService, usersRepository } = this.dependencies;

    const user = await usersRepository.findUserByEmail(dto.email);

    if (!user) {
      logger.warn(`User with email ${dto.email} does not exist`);

      // We don't want to reveal that user with this email does not exist.
      return right(Result.ok({ status: 'ok' }));
    }

    const loginLink = await authService.createSignInLink(dto.email, dto.continueUrl);

    await this.sendApplicationLoginLink({
      user,
      loginLink,
      requestedLanguage: dto.lang,
    });

    return right(Result.ok({ status: 'ok' }));
  }

  private async sendApplicationLoginLink({
    user,
    loginLink,
    requestedLanguage,
  }: {
    user: UserDocument;
    loginLink: string;
    requestedLanguage: string;
  }) {
    const { mailer, applicationLoginEmailTemplate } = this.dependencies;

    await mailer.sendEmail({
      email: user.email,
      dynamicTemplateData: {
        link: loginLink,
        firstName: user.firstName,
        en: requestedLanguage === 'en' || user.lang === 'en',
      },
      templateAlias: applicationLoginEmailTemplate,
    });
  }
}
