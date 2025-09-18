import { AppThunk } from '../../../index';
import { resetPasswordFailed, resetPasswordStarted, resetPasswordSuccess } from '../reducer';
import { updateUserData } from './updateUserData';

export interface LoginData {
  password: string;
  oldPassword?: string;
}

export const setUserPassword =
  ({ password, oldPassword }: LoginData, callback?: () => void): AppThunk =>
  async (dispatch, _, { auth }) => {
    dispatch(resetPasswordStarted());
    try {
      const user = auth().currentUser;
      if (!user || !user.email) {
        throw new Error('wrong-login-data');
      }

      if (oldPassword) {
        await auth().signInWithEmailAndPassword(user.email, oldPassword);
      }

      await user.updatePassword(password);

      if (callback) {
        callback();
      }

      if (!oldPassword) {
        dispatch(
          updateUserData({
            uid: user.uid,
            onboarding: {
              loginOnlyByLink: false,
              showPasswordBanner: false,
            },
          })
        );
      }

      dispatch(resetPasswordSuccess());
    } catch (e) {
      const error = e as any;
      dispatch(resetPasswordFailed(error.code));
    }
  };
