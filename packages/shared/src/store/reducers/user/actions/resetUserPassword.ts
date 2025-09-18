import { AppThunk } from '../../../index';
import { resetPasswordFailed, resetPasswordStarted, resetPasswordSuccess } from '../reducer';

export interface ResetPasswordData {
  resetPasswordCode: string;
  password: string;
}

export const resetUserPassword =
  ({ resetPasswordCode, password }: ResetPasswordData, callback?: () => void): AppThunk =>
  async (dispatch, getState, { auth }) => {
    dispatch(resetPasswordStarted());
    try {
      await auth().confirmPasswordReset(resetPasswordCode, password);

      if (callback) {
        callback();
      }

      dispatch(resetPasswordSuccess());
    } catch (e) {
      dispatch(resetPasswordFailed((e as any).code));
    }
  };
