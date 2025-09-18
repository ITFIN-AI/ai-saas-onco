import { AppThunk } from '../../../index';
import {
  updateUserDetailsStarted,
  updateUserDetailsSuccess,
  updateUserDetailsFailed,
} from '../reducer';
import { COLLECTION } from '../../../../firestore/collectionNames';
import { UserDocument } from '../../../../models/documents';

export const updateUserData =
  (
    userData: Partial<UserDocument> & Pick<UserDocument, 'uid'>,
    token?: string,
    onSuccess?: () => void,
    onFailure?: () => void
  ): AppThunk =>
  async (dispatch, getState, { firestore }) => {
    try {
      const ref = firestore().collection(COLLECTION.USERS).doc(userData.uid);

      dispatch(updateUserDetailsStarted());
      await ref.update({
        ...userData,
        ...(token ? { mobileFcmTokens: firestore.FieldValue.arrayUnion(token) } : {}),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      onSuccess?.();
      dispatch(updateUserDetailsSuccess());
    } catch (e) {
      onFailure?.();
      dispatch(updateUserDetailsFailed());
    }
  };
