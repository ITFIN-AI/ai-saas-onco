import { AppThunk } from '../../../index';
import { unsubscribeFromUserDetails as unsubscribeAction } from '../reducer';

export const unsubscribeFromUserDetails =
  (): AppThunk =>
  (dispatch, _, { firestoreSubscriptions }) => {
    if (firestoreSubscriptions.userDetailsListener) {
      firestoreSubscriptions.userDetailsListener();
    }
    dispatch(unsubscribeAction());
  };
