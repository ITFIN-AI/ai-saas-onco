import { AppThunk } from '../../../index';
import { COLLECTION } from '../../../../firestore/collectionNames';
import {
  subscribeToCreatorStatsSuccess,
  subscribeToCreatorStatsStarted,
  subscribeToCreatorStatsFailed,
} from '../reducer';
import { firestoreDateMapper } from '../../../../helpers/firestoreDateMapper';
import { CreatorStatsDocument } from '../../../../models/documents/Reports';
import { fetchCurrentMonthStats } from './fetchCurrentMonthStats';

export const subscribeToCreatorStats =
  (): AppThunk =>
  (dispatch, getState, { firestoreSubscriptions, db, auth }) => {
    try {
      dispatch(subscribeToCreatorStatsStarted());

      const user = auth().currentUser;
      if (!user || !user.email) {
        throw new Error('user-is-not-logged');
      }

      firestoreSubscriptions.reportsListener?.();

      const ref = db.collection(COLLECTION.REPORTS).doc(user.uid);

      firestoreSubscriptions.reportsListener = ref.onSnapshot(
        (snapshot) => {
          dispatch(
            subscribeToCreatorStatsSuccess(
              snapshot.exists ? firestoreDateMapper<CreatorStatsDocument>(snapshot) : null
            )
          );
          if (snapshot.exists) {
            setTimeout(() => {
              dispatch(fetchCurrentMonthStats());
            }, 500);
          }
        },
        () => {
          dispatch(subscribeToCreatorStatsFailed());
        }
      );
    } catch (e) {
      dispatch(subscribeToCreatorStatsFailed());
    }
  };
