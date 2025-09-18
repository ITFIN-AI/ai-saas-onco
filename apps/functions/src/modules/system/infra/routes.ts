import * as functions from 'firebase-functions';
import { FirebaseUsersRepository } from 'shared/infra/repositories/FirebaseUsersRepository';
import { AdminHandlerController } from 'modules/system/useCases/adminHandler/AdminHandlerController';
import { AdminHandlerUseCase } from '../useCases/adminHandler/AdminHandlerUseCase';
import { FirebaseAuthService } from 'shared/infra/services/FirebaseAuthService';
import { getAuth } from 'firebase-admin/auth';
import { env, db } from 'config';
import { DEFAULT_FIREBASE_REGION } from '@akademiasaas/shared';

const { logger } = functions;

const usersRepository = new FirebaseUsersRepository({ db });
const authService = new FirebaseAuthService({
  logger: functions.logger,
  adminClient: getAuth(),
  usersRepository,
  env,
});

export const listenOnAdminEvents = functions
  .runWith({ timeoutSeconds: 540, memory: '2GB' })
  .region(DEFAULT_FIREBASE_REGION)
  .pubsub.topic(env.pubsub.admin)
  .onPublish((message) => {
    logger.debug('Message:', message.attributes.type);

    return new AdminHandlerController(
      new AdminHandlerUseCase({
        logger,
        authService,
      })
    ).execute(message.attributes);
  });
