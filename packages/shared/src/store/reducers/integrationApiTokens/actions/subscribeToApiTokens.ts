import { AppThunk } from '../../../index';
import {
  subscribeToApiTokensFailed,
  subscribeToApiTokensStarted,
  subscribeToApiTokensSuccess,
} from '../reducer';
import { ApiTokenDocument } from '../../../../models/documents';
import { firestoreDateMapper } from '../../../../helpers/firestoreDateMapper';
import { COLLECTION, DOCUMENT } from '../../../../firestore';

export const subscribeToApiTokens =
  (): AppThunk =>
  (dispatch, getState, { firestoreSubscriptions, db, auth }) => {
    try {
      dispatch(subscribeToApiTokensStarted());
      const user = auth().currentUser;
      if (!user || !user.email) {
        throw new Error('user-is-not-logged');
      }

      firestoreSubscriptions.apiTokenListener?.();

      const ref = db
        .collection(COLLECTION.USERS)
        .doc(user.uid)
        .collection(COLLECTION.SETTINGS)
        .doc(DOCUMENT.INTEGRATION_CONFIG)
        .collection(COLLECTION.API_TOKENS)
        .where('uid', '==', user.uid);

      firestoreSubscriptions.apiTokenListener = ref.onSnapshot(
        (snapshot) => {
          dispatch(
            subscribeToApiTokensSuccess(
              snapshot.docs
                .map((doc) => firestoreDateMapper<ApiTokenDocument>(doc))
                .map((doc) => ({
                  ...doc,
                  expiresAt: (doc.expiresAt as any)?.toDate?.() || null,
                })) ?? null
            )
          );
        },
        (e) => {
          dispatch(subscribeToApiTokensFailed((e as any).message));
        }
      );
    } catch (e) {
      const error = e as any;
      dispatch(subscribeToApiTokensFailed(error.message));
    }
  };
