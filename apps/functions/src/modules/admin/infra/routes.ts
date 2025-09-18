import * as functions from 'firebase-functions';
import { FirebaseUsersRepository } from 'shared/infra/repositories/FirebaseUsersRepository';
import { BroadcastMessageController } from '../useCases/broadcastMessage/BroadcastMessageController';
import { BroadcastMessageUseCase } from '../useCases/broadcastMessage/BroadcastMessageUseCase';
import { FirebaseAuthService } from 'shared/infra/services/FirebaseAuthService';
import { BroadcastService } from 'shared/services/BroadcastService';
import { FirebaseNotificationRepository } from 'shared/infra/repositories/FirebaseNotificationsRepository';
import { getAuth } from 'firebase-admin/auth';
import { DEFAULT_FIREBASE_REGION } from '@akademiasaas/shared';
import { env, db } from 'config';

const { logger } = functions;

const notificationsRepository = new FirebaseNotificationRepository({ db });
const usersRepository = new FirebaseUsersRepository({ db });
const authService = new FirebaseAuthService({
  logger: functions.logger,
  adminClient: getAuth(),
  usersRepository,
  env,
});

const broadcastService = new BroadcastService({
  notificationsRepository,
  usersRepository,
});

export const broadcastMessage = functions
  .region(DEFAULT_FIREBASE_REGION)
  .https.onCall((data, context) =>
    new BroadcastMessageController(
      new BroadcastMessageUseCase({
        logger,
        authService,
        broadcastService,
      })
    ).execute(data, context)
  );
