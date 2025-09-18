import { AppThunk } from '../../../index';
import { sendLoginLinkSuccess, sendLoginLinkStarted } from '../reducer';

export const sendLoginLink =
  (email: string, continueUrl: string, lang: string): AppThunk =>
  async (dispatch, _, { functions }) => {
    dispatch(sendLoginLinkStarted());

    try {
      await functions.httpsCallable('users-sendLinkToLogin')({ email, continueUrl, lang });
    } catch (e) {
      // show success message even for wrong data
    } finally {
      dispatch(sendLoginLinkSuccess());
    }
  };
