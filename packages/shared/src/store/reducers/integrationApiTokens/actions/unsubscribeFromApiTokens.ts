import { AppThunk } from '../../../index';
import { unsubscribeFromApiTokens as actionCreator } from '../reducer';

export const unsubscribeFromApiTokens =
  (): AppThunk =>
  (dispatch, getState, { firestoreSubscriptions }) => {
    firestoreSubscriptions.integrationListener?.();
    dispatch(actionCreator());
  };
