import { AppThunk } from '../../../index';
import { logInFailed, logInStarted, logInSuccess } from '../reducer';
import { getUserDetails } from './getUserDetails';
import { UserStatus } from '../types';

export interface LoginData {
  email: string;
  password: string;
}

export const logInUser =
  ({ email, password }: LoginData, callback?: () => void): AppThunk =>
  async (dispatch, getState, { auth, analytics }) => {
    const { user } = getState();

    if (user.status === UserStatus.LOGGING_IN || user.data?.email === email) {
      return;
    }
    dispatch(logInStarted());
    try {
      const res = await auth().signInWithEmailAndPassword(email, password);

      if (!res.user) {
        return;
      }
      const { uid, email: userEmail } = res.user;

      dispatch(
        logInSuccess({
          uid,
          email: userEmail,
        })
      );
      analytics.identify(uid, { email: userEmail });
      dispatch(getUserDetails(uid));
      if (callback) {
        callback();
      }
    } catch (e) {
      const error = e as any;
      dispatch(logInFailed(error.code));
    }
  };
