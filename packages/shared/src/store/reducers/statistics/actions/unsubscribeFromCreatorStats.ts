import { AppThunk } from '../../../index';
import { unsubscribeFromCreatorStats as actionCreator } from '../reducer';

export const unsubscribeFromCreatorStats =
  (): AppThunk =>
  (dispatch, getState, { firestoreSubscriptions }) => {
    firestoreSubscriptions.reportsListener?.();
    dispatch(actionCreator());
  };
