import { UserOnboarding } from '@akademiasaas/shared';

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string[] | null;
  onboarding?: UserOnboarding;
  termsAndPolicyAcceptDate: null | Date;
  termsAndPrivacyPolicy: boolean;
}

export type UserId = string;

export interface AuthService {
  createUser: (userData: CreateUserDto) => Promise<UserId>;
  addSystemRole: (uid: string, role: 'admin' | 'moderator') => Promise<void>;
  updatePassword: (uid: string, password: string) => Promise<void>;
  createSignInLink: (email: string, continueUrl?: string) => Promise<string>;
  createResetPasswordLink: (email: string, continueUrl?: string) => Promise<string>;
  isSystemAdmin: (uid: string) => Promise<boolean>;
}
