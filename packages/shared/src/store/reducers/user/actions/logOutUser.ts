import { AppThunk } from '../../../index';
import { logOutFailed, logOutStarted, logOutSuccess } from '../reducer';
import { unsubscribeFromUserDetails } from './unsubscribeFromUserDetails';

export const logOutUser =
  (callback?: () => void): AppThunk =>
  async (dispatch, getState, { auth }) => {
    dispatch(logOutStarted());
    try {
      await auth().signOut();
      dispatch(unsubscribeFromUserDetails());
      dispatch(logOutSuccess());
      callback?.();
    } catch (e) {
      const error = e as any;
      dispatch(logOutFailed(error.code));
    }
  };
