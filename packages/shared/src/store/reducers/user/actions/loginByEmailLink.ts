import { AppThunk } from '../../../index';
import { logInFailed, logInStarted, logInSuccess } from '../reducer';
import { getUserDetails } from './getUserDetails';

export interface LoginData {
  email: string;
  href: string;
}

export const loginByEmailLink =
  (
    { href, email }: LoginData,
    callback?: () => void,
    onFailure?: (code: string, message: string) => void
  ): AppThunk =>
  async (dispatch, _, { auth, analytics }) => {
    dispatch(logInStarted());
    try {
      const res = await auth().signInWithEmailLink(email, href);

      if (!res.user) {
        throw new Error('wrong-login-data');
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
      onFailure?.(error.code, error.message);
      dispatch(logInFailed(error.code));
    }
  };
