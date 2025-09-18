import { AppThunk } from '../../../index';
import { getUserDetailsFailed, getUserDetailsStarted, getUserDetailsSuccess } from '../reducer';
import { UserDocument } from '../../../../models/documents';
import firebase from 'firebase/compat';
import { logOutUser } from './logOutUser';
import { COLLECTION } from '../../../../firestore';

export const getUserDetails =
  (uid: string): AppThunk =>
    async (dispatch, getState, { db, firestoreSubscriptions, analytics, auth }) => {
      dispatch(getUserDetailsStarted());
      try {
        const ref = db.collection(COLLECTION.USERS).doc(uid);

        if (firestoreSubscriptions.userDetailsListener) {
          firestoreSubscriptions.userDetailsListener();
        }

        const idTokenResult = await auth().currentUser?.getIdTokenResult();
        const isImpersonated = idTokenResult?.claims?.impersonated || false;

        firestoreSubscriptions.userDetailsListener = ref.onSnapshot(
          (snapshot) => {
            const data = snapshot.data() as
              | (UserDocument & {
                createdAt: firebase.firestore.Timestamp;
                updatedAt: firebase.firestore.Timestamp;
              })
              | undefined;
            dispatch(
              getUserDetailsSuccess(
                data
                  ? {
                    ...data,
                    createdAt: data.createdAt?.toDate(),
                    updatedAt: data.updatedAt?.toDate(),
                    systemRole: idTokenResult?.claims?.systemRole || null,
                    isImpersonated,
                  }
                  : undefined
              )
            );
            if (data) {
              analytics.updateUserProperties(uid, {
                email: data?.email,
                name: data.firstName ? `${data.firstName} ${data.lastName ?? ''}` : undefined,
              });
            }
          },
          () => {
            dispatch(getUserDetailsFailed());
            dispatch(logOutUser());
          }
        );
      } catch (e) {
        dispatch(getUserDetailsFailed());
      }
    };
