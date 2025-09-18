import { AppThunk } from '../../../index';
import firebase from 'firebase/compat';
import { logInSuccess } from '../reducer';
import { getUserDetails } from './getUserDetails';
import { UserStatus } from '../types';

export const setLoggedUserData =
  ({ uid, email }: firebase.User): AppThunk =>
  async (dispatch, getState, { analytics }) => {
    const { status } = getState().user;

    if (status === UserStatus.LOGGING_IN) {
      return;
    }

    dispatch(
      logInSuccess({
        uid,
        email,
      })
    );
    dispatch(getUserDetails(uid));
    analytics.identify(uid, { email });
  };
