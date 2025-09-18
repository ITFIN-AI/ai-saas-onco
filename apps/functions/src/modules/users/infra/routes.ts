import * as functions from 'firebase-functions';
import * as https from 'firebase-functions/v2/https';

import {
  DEFAULT_FIREBASE_REGION,
  EMAIL_TEMPLATE_ALIASES,
  UserDocument,
  UserEventType,
} from '@akademiasaas/shared';
import { BusinessEventsService } from 'shared/domain/bussinesEvents/BusinessEventsService';
import { FirebaseUsersRepository } from 'shared/infra/repositories/FirebaseUsersRepository';
import { SendLinkToLoginController } from 'modules/users/useCases/sendLinkToLogin/SendLinkToLoginController';
import { SendLinkToLoginUseCase } from 'modules/users/useCases/sendLinkToLogin/SendLinkToLoginUseCase';
import { FirebaseAuthService } from 'shared/infra/services/FirebaseAuthService';
import { getAuth } from 'firebase-admin/auth';
import { PostmarkEmailService } from 'shared/infra/services/PostmarkEmailService';
import { FirebaseApiTokensRepository } from 'shared/infra/repositories/FirebaseApiTokensRepository';
import { CreateApiTokenController } from 'modules/users/useCases/createApiToken/CreateApiTokenController';
import { CreateApiTokenUseCase } from 'modules/users/useCases/createApiToken/CreateApiTokenUseCase';
import { DeleteApiTokenController } from 'modules/users/useCases/deleteApiToken/DeleteApiTokenController';
import { DeleteApiTokenUseCase } from 'modules/users/useCases/deleteApiToken/DeleteApiTokenUseCase';
import { SendResetPasswordEmailController } from 'modules/users/useCases/sendResetPasswordEmail/SendResetPasswordEmailController';
import { SendResetPasswordEmailUseCase } from 'modules/users/useCases/sendResetPasswordEmail/SendResetPasswordEmailUseCase';
import { GetUserMetadataController } from 'modules/users/useCases/getUserMetadata/GetUserMetadataController';
import { GetUserMetadataUseCase } from 'modules/users/useCases/getUserMetadata/GetUserMetadataUseCase';
import { PubSub } from '@google-cloud/pubsub';
import { env, db } from 'config';

const pubsub = new PubSub();

const businessEventsService = new BusinessEventsService({
  pubSubClient: pubsub,
  logger: functions.logger,
  businessEventsConfig: { domain: env.domain, topic: env.pubsub.businessEvents },
});

const usersRepository = new FirebaseUsersRepository({ db });

const authService = new FirebaseAuthService({
  logger: functions.logger,
  adminClient: getAuth(),
  usersRepository,
  env,
});

const postmarkClient = new PostmarkEmailService({
  logger: functions.logger,
  postmarkApiKey: env.postmark.apiKey,
  defaultSender: env.postmark.defaultSender,
  domain: env.domain,
});

export const onUserCreateListener = functions
  .region(DEFAULT_FIREBASE_REGION)
  .firestore.document('users/{userId}')
  .onCreate((snap) => {
    const user = snap.data() as UserDocument;

    return businessEventsService.publish({
      eventType: UserEventType.UserCreated,
      payload: { userId: user.uid, email: user.email ?? '' },
    });
  });

export const sendLinkToLogin = functions
  .region(DEFAULT_FIREBASE_REGION)
  .https.onCall((data, context) => {
    const controller = new SendLinkToLoginController(
      new SendLinkToLoginUseCase({
        applicationLoginEmailTemplate: EMAIL_TEMPLATE_ALIASES.APP_LOGIN_BY_LINK,
        mailer: postmarkClient,
        authService,
        usersRepository,
        logger: functions.logger,
      })
    );

    return controller.execute(data, context);
  });

export const sendLinkToLoginV2 = https.onCall(
  { region: DEFAULT_FIREBASE_REGION, memory: '512MiB', concurrency: 10 },
  (request) => {
    const controller = new SendLinkToLoginController(
      new SendLinkToLoginUseCase({
        applicationLoginEmailTemplate: EMAIL_TEMPLATE_ALIASES.APP_LOGIN_BY_LINK,
        mailer: postmarkClient,
        authService,
        usersRepository,
        logger: functions.logger,
      })
    );

    return controller.execute(request.data, request);
  }
);

export const sendResetPasswordEmail = functions
  .region(DEFAULT_FIREBASE_REGION)
  .https.onCall((data, context) => {
    const controller = new SendResetPasswordEmailController(
      new SendResetPasswordEmailUseCase({
        resetPasswordEmailTemplate: EMAIL_TEMPLATE_ALIASES.RESET_PASSWORD,
        mailer: postmarkClient,
        authService,
        usersRepository,
        logger: functions.logger,
        appHost: env.domain,
      })
    );

    return controller.execute(data, context);
  });

const apiTokensRepository = new FirebaseApiTokensRepository({ db });

export const createApiToken = functions
  .region(DEFAULT_FIREBASE_REGION)
  .https.onCall((data, context) => {
    const controller = new CreateApiTokenController(
      new CreateApiTokenUseCase({
        logger: functions.logger,
        issuer: env.domain,
        audience: env.domain,
        jwtPrivateKey: env.api.jwtPrivateKey,
        apiTokensRepository,
        usersRepository,
      })
    );

    return controller.execute(data, context);
  });

export const deleteApiToken = functions
  .region(DEFAULT_FIREBASE_REGION)
  .https.onCall((data, context) => {
    const controller = new DeleteApiTokenController(
      new DeleteApiTokenUseCase({
        logger: functions.logger,
        apiTokensRepository,
      })
    );

    return controller.execute(data, context);
  });

export const getUserMetadata = functions
  .region(DEFAULT_FIREBASE_REGION)
  .https.onCall((data, context) => {
    const controller = new GetUserMetadataController(
      new GetUserMetadataUseCase({
        logger: functions.logger,
      })
    );

    return controller.execute(data, context);
  });
