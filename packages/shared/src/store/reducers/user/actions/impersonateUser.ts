import { createAsyncThunk } from '@reduxjs/toolkit';
import { AsyncThunkCreator } from '../../../index';
import { USER_REDUCER, logInSuccess } from '../reducer';
import { getUserDetails } from './getUserDetails';

export const impersonateUser = createAsyncThunk<void, string, AsyncThunkCreator<string>>(
  `${USER_REDUCER}/impersonateUser`,
  async (customToken, { dispatch, rejectWithValue, extra: { auth } }) => {
    try {
      const result = await auth().signInWithCustomToken(customToken);

      if (!result.user) {
        throw new Error('No user data after impersonation');
      }

      const { uid, email } = result.user;

      dispatch(
        logInSuccess({
          uid,
          email,
        })
      );

      dispatch(getUserDetails(uid));
    } catch (e) {
      if (e instanceof Error) {
        return rejectWithValue(e.message);
      }

      return rejectWithValue('Failed to impersonate user');
    }

    return;
  }
);
