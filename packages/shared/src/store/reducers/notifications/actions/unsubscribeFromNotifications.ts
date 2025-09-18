import { AppThunk } from '../../../index';
import { unsubscribeFromNotifications as actionCreator } from '../reducer';

export const unsubscribeFromNotifications =
  (): AppThunk =>
  (dispatch, getState, { firestoreSubscriptions }) => {
    firestoreSubscriptions.notificationsListener?.();
    dispatch(actionCreator());
  };
