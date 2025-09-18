import { AppThunk } from '../../../index';
import { finishRegisterStarted, finishRegisterFailed, finishRegisterSuccess } from '../reducer';
import { COLLECTION } from '../../../../firestore/collectionNames';

export interface FinishRegisterData {
  firstName: string;
  lastName: string;
  termsAndPrivacyPolicy: boolean;
}

export const fulfillUserDetails =
  (
    { lastName, firstName, termsAndPrivacyPolicy }: FinishRegisterData,
    callback?: () => void
  ): AppThunk =>
  async (dispatch, _, { auth, firestore }) => {
    dispatch(finishRegisterStarted());
    try {
      const { currentUser } = auth();
      if (!currentUser) {
        throw new Error('Error when creating new account');
      }
      await firestore().collection(COLLECTION.USERS).doc(currentUser.uid).set({
        firstName,
        lastName,
        email: currentUser.email,
        uid: currentUser.uid,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        termsAndPrivacyPolicy,
      });
      dispatch(finishRegisterSuccess());
      if (callback) {
        callback();
      }
    } catch (_e) {
      dispatch(finishRegisterFailed());
    }
  };
