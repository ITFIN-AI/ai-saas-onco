import { AppThunk } from '../../../index';
import { COLLECTION } from '../../../../firestore/collectionNames';
import {
  subscribeToSubscriptionFailed,
  subscribeToSubscriptionStarted,
  subscribeToSubscriptionSuccess,
} from '../reducer';
import { Stripe } from 'stripe';

export const subscribeToSubscription =
  (subscriptionId: string): AppThunk =>
  (dispatch, getState, { firestoreSubscriptions, db, auth }) => {
    try {
      dispatch(subscribeToSubscriptionStarted());

      const user = auth().currentUser;
      if (!user || !user.email) {
        throw new Error('user-is-not-logged');
      }

      firestoreSubscriptions.subscriptionListener?.();

      const ref = db
        .collection(COLLECTION.USERS)
        .doc(user.uid)
        .collection(COLLECTION.USER_SUBSCRIPTIONS)
        .doc(subscriptionId);

      firestoreSubscriptions.subscriptionListener = ref.onSnapshot(
        (snapshot) => {
          if (!snapshot.exists) {
            throw new Error('Subscription not exists');
          }
          dispatch(subscribeToSubscriptionSuccess(snapshot.data() as Stripe.Subscription));
        },
        () => {
          dispatch(subscribeToSubscriptionFailed());
        }
      );
    } catch (e) {
      dispatch(subscribeToSubscriptionFailed());
    }
  };
