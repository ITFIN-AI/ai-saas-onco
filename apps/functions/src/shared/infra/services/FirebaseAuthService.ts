import { AuthService, CreateUserDto } from '../../services/AuthService';
import { Auth } from 'firebase-admin/auth';
import { UsersRepository } from '../../domain/repositories/UsersRepository';
import { logger } from 'firebase-functions';
import { EnvConfig } from 'shared/infra/types';
import { UserDocument } from '@akademiasaas/shared';

interface Dependencies {
  usersRepository: UsersRepository;
  adminClient: Auth;
  logger: typeof logger;
  env: EnvConfig;
}

export class FirebaseAuthService implements AuthService {
  constructor(private dependencies: Dependencies) {}

  public async createUser(userData: CreateUserDto) {
    const { adminClient, usersRepository, logger } = this.dependencies;
    const newUser = await adminClient.createUser({
      email: userData.email,
      displayName: `${userData.firstName} ${userData.lastName}`,
    });
    logger.info(`Created new user ${newUser.uid} for email ${userData.email}`);

    const userDocument: UserDocument = {
      ...userData,
      contactEmail: null,
      mobileFcmTokens: null,
      webFcmTokens: null,
      avatarUrl: userData.avatarUrl || null,
      uid: newUser.uid,
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    await usersRepository.createUser(userDocument);
    logger.info('Created user document into database.');

    return newUser.uid;
  }

  public async updatePassword(uid: string, password: string) {
    await this.dependencies.adminClient.updateUser(uid, { password });
  }

  public async addSystemRole(uid: string, role: 'admin' | 'moderator') {
    const { adminClient } = this.dependencies;
    await adminClient.setCustomUserClaims(uid, { systemRole: role });
  }

  createSignInLink(email: string, continueUrl?: string) {
    const { adminClient, env } = this.dependencies;

    return adminClient.generateSignInWithEmailLink(email, {
      url: continueUrl || `${env.domain}/auth/sign-with-link`,
    });
  }

  createResetPasswordLink(email: string, continueUrl?: string) {
    const { adminClient, env } = this.dependencies;

    return adminClient.generatePasswordResetLink(email, {
      url: continueUrl || env.domain,
    });
  }

  public async isSystemAdmin(uid: string) {
    const { adminClient } = this.dependencies;
    const user = await adminClient.getUser(uid);

    return user.customClaims?.systemRole === 'admin';
  }
}
