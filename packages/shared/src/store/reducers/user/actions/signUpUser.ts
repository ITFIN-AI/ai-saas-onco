import firebase from 'firebase/compat';

import { AppThunk } from '../../../index';
import { signUpFailed, signUpStarted, signUpSuccess } from '../reducer';
import { logInUser } from './logInUser';
import { COLLECTION } from '../../../../firestore/collectionNames';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  termsAndPrivacyPolicy: boolean;
  lang: string;
  timezone: string;
  ip: string | null;
  phoneNumber: string | null;
}

async function getCountry(functions: firebase.functions.Functions): Promise<string | null> {
  try {
    const result = await functions.httpsCallable('users-getUserMetadata')();

    return result.data.body.country;
  } catch (_e) {
    return null;
  }
}

export const signUpUser =
  (
    {
      email,
      password,
      lastName,
      firstName,
      termsAndPrivacyPolicy,
      lang,
      timezone,
      ip,
      phoneNumber,
    }: RegisterData,
    callback?: () => void,
    onFail?: () => void
  ): AppThunk =>
  async (dispatch, _, { auth, functions, firestore }) => {
    dispatch(signUpStarted());
    try {
      const res = await auth().createUserWithEmailAndPassword(email, password);
      if (!res.user) {
        throw new Error('Error when creating new account');
      }

      const country = await getCountry(functions);

      await firestore()
        .collection(COLLECTION.USERS)
        .doc(res.user.uid)
        .set({
          firstName,
          lastName,
          email: email.toLowerCase(),
          ip,
          uid: res.user.uid,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
          termsAndPolicyAcceptDate: firestore.FieldValue.serverTimestamp(),
          termsAndPrivacyPolicy,
          lang,
          timezone,
          ...(country && { country }),
          phoneNumber,
        });
      dispatch(signUpSuccess());

      dispatch(logInUser({ email, password }));
      if (callback) {
        callback();
      }
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = e as any;
      dispatch(signUpFailed(error.code));

      if (onFail) {
        onFail();
      }
    }
  };
