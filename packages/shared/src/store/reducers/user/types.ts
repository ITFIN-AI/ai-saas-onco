import { RequestStatus } from '../../../enums/requestStatus';
import { UserDocument } from '../../../models/documents/UserDocument';

export enum UserStatus {
  CREATING_NEW_ACCOUNT = 'CREATING_NEW_ACCOUNT',
  LOGGING_IN = 'LOGGING_IN',
  IS_LOGGED = 'IS_LOGGED',
  IS_LOGGED_OUT = 'IS_LOGGED_OUT',
  LOGGING_OUT = 'LOGGING_OUT',
  HAS_ERROR = 'HAS_ERROR',
  NEW_ACCOUNT_CREATED = 'NEW_ACCOUNT_CREATED',
}

export interface User {
  email: string | null;
  uid: string;
}

export interface UserReducer {
  appVersion: string | null;
  status: null | UserStatus;
  details: null | (UserDocument & { systemRole: 'admin' | null });
  data: null | User;
  error: null | string;
  registerError: null | string;
  detailsStatus: RequestStatus | null;
  passwordStatus: RequestStatus | null;
  updateUserDataStatus: RequestStatus | null;
  sendPasswordResetEmailStatus: RequestStatus | null;
  sendLoginLinkStatus: RequestStatus | null;
  isAdmin: boolean;
  isImpersonated: boolean;
  impersonateStatus?: RequestStatus;
}
