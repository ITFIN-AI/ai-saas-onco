import { AppThunk } from '../../../index';
import { unsubscribeFromSubscription as actionCreator } from '../reducer';

export const unsubscribeFromSubscription =
  (): AppThunk =>
  (dispatch, getState, { firestoreSubscriptions }) => {
    firestoreSubscriptions.subscriptionListener?.();
    dispatch(actionCreator());
  };
