import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserReducer, UserStatus } from './types';
import { RequestStatus } from '../../../enums/requestStatus';
import { UserDocument } from '../../../models/documents/UserDocument';
import { impersonateUser } from './actions';

const initialState: UserReducer = {
  details: null,
  status: null,
  error: null,
  registerError: null,
  detailsStatus: null,
  passwordStatus: null,
  sendPasswordResetEmailStatus: null,
  sendLoginLinkStatus: null,
  appVersion: null,
  data: null,
  updateUserDataStatus: null,
  isAdmin: false,
  isImpersonated: false,
};

export const USER_REDUCER = 'User';

const userSlice = createSlice({
  name: USER_REDUCER,
  initialState,
  reducers: {
    signUpStarted(state) {
      return {
        ...state,
        status: UserStatus.CREATING_NEW_ACCOUNT,
        error: null,
      };
    },
    signUpSuccess(state) {
      return {
        ...state,
        status: UserStatus.NEW_ACCOUNT_CREATED,
      };
    },
    signUpFailed(state, { payload }: PayloadAction<string>) {
      return {
        ...state,
        status: UserStatus.HAS_ERROR,
        registerError: payload,
      };
    },
    logInStarted(state) {
      return {
        ...state,
        status: UserStatus.LOGGING_IN,
        error: null,
      };
    },
    logInSuccess(state, { payload: { uid, email } }: PayloadAction<User>) {
      return {
        ...state,
        status: UserStatus.IS_LOGGED,
        data: {
          uid,
          email,
        },
      };
    },
    logInFailed(state, { payload }: PayloadAction<string>) {
      return {
        ...state,
        status: UserStatus.HAS_ERROR,
        error: payload,
      };
    },
    logOutStarted(state) {
      return {
        ...state,
        error: null,
        status: UserStatus.LOGGING_OUT,
      };
    },
    logOutSuccess(state) {
      return {
        ...state,
        data: null,
        status: UserStatus.IS_LOGGED_OUT,
        detailsStatus: null,
        isImpersonated: false,
      };
    },
    logOutFailed(state, { payload }: PayloadAction<string>) {
      return {
        ...state,
        status: UserStatus.HAS_ERROR,
        error: payload,
      };
    },
    getUserDetailsStarted(state) {
      return {
        ...state,
        detailsStatus: RequestStatus.FETCHING,
      };
    },
    getUserDetailsSuccess(
      state,
      {
        payload,
      }: PayloadAction<
        (UserDocument & { systemRole: null | 'admin' } & { isImpersonated: boolean }) | undefined
      >
    ) {
      return {
        ...state,
        detailsStatus: RequestStatus.SUCCESS,
        details: payload || null,
        isAdmin: payload?.systemRole === 'admin',
        isImpersonated: payload?.isImpersonated || false,
      };
    },
    getUserDetailsFailed(state) {
      return {
        ...state,
        detailsStatus: RequestStatus.FAILED,
      };
    },
    updateUserDetailsStarted(state) {
      state.updateUserDataStatus = RequestStatus.UPDATING;
    },
    updateUserDetailsSuccess(state) {
      state.updateUserDataStatus = RequestStatus.SUCCESS;
    },
    updateUserDetailsFailed(state) {
      state.updateUserDataStatus = RequestStatus.FAILED;
    },
    resetPasswordStarted(state) {
      return {
        ...state,
        passwordStatus: RequestStatus.UPDATING,
        error: null,
      };
    },
    resetPasswordSuccess(state) {
      return {
        ...state,
        passwordStatus: RequestStatus.SUCCESS,
        error: null,
      };
    },
    resetPasswordFailed(state, { payload }: PayloadAction<string>) {
      return {
        ...state,
        passwordStatus: RequestStatus.FAILED,
        error: payload,
      };
    },
    sendPasswordResetStarted(state) {
      return {
        ...state,
        sendPasswordResetEmailStatus: RequestStatus.FETCHING,
        error: null,
      };
    },

    sendPasswordResetSuccess(state) {
      return {
        ...state,
        sendPasswordResetEmailStatus: RequestStatus.SUCCESS,
        error: null,
      };
    },

    sendLoginLinkStarted(state) {
      return {
        ...state,
        sendLoginLinkStatus: RequestStatus.FETCHING,
        error: null,
      };
    },

    sendLoginLinkSuccess(state) {
      return {
        ...state,
        sendLoginLinkStatus: RequestStatus.SUCCESS,
        error: null,
      };
    },

    resetErrors(state) {
      return {
        ...state,
        error: null,
        passwordStatus: null,
      };
    },
    resetUserStatus(state) {
      return {
        ...state,
        status: null,
      };
    },
    unsubscribeFromUserDetails(state) {
      state.isAdmin = false;
      state.details = null;
      state.detailsStatus = null;
    },
    finishRegisterStarted(state) {
      state.status = UserStatus.LOGGING_IN;
    },
    finishRegisterSuccess(state) {
      state.status = UserStatus.IS_LOGGED;
    },
    finishRegisterFailed(state) {
      state.status = UserStatus.HAS_ERROR;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(impersonateUser.pending, (state) => {
      state.impersonateStatus = RequestStatus.SUBSCRIBING;
    });
    builder.addCase(impersonateUser.fulfilled, (state) => {
      state.impersonateStatus = RequestStatus.SUCCESS;
      state.isImpersonated = true;
    });
    builder.addCase(impersonateUser.rejected, (state) => {
      state.impersonateStatus = RequestStatus.FAILED;
    });
  },
});

export const {
  logInFailed,
  logInStarted,
  logInSuccess,
  logOutStarted,
  logOutFailed,
  logOutSuccess,
  getUserDetailsFailed,
  getUserDetailsStarted,
  getUserDetailsSuccess,
  unsubscribeFromUserDetails,
  updateUserDetailsFailed,
  updateUserDetailsStarted,
  updateUserDetailsSuccess,
  sendPasswordResetStarted,
  sendPasswordResetSuccess,
  signUpFailed,
  signUpStarted,
  signUpSuccess,
  sendLoginLinkSuccess,
  sendLoginLinkStarted,
  resetPasswordFailed,
  resetPasswordStarted,
  resetPasswordSuccess,
  resetErrors,
  finishRegisterStarted,
  finishRegisterFailed,
  finishRegisterSuccess,
} = userSlice.actions;

export default userSlice.reducer;
