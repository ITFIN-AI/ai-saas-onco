import { AppThunk } from '../../../index';
import { sendPasswordResetStarted, sendPasswordResetSuccess } from '../reducer';

export const sendPasswordResetEmail =
  (email: string, continueUrl: string): AppThunk =>
  async (dispatch, _, { functions }) => {
    dispatch(sendPasswordResetStarted());

    try {
      await functions.httpsCallable('users-sendResetPasswordEmail')({ email, continueUrl });
    } catch {
      // show success message even for wrong data
    } finally {
      dispatch(sendPasswordResetSuccess());
    }
  };
