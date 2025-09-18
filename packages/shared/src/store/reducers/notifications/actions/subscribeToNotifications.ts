import { NotificationStatus, Notification } from '../../../../models/documents/notifications';
import { AppThunk } from '../../../index';
import firebase from 'firebase/compat';
import { COLLECTION } from '../../../../firestore/collectionNames';
import {
  subscribeToNotificationsFailed,
  subscribeToNotificationsStarted,
  subscribeToNotificationsSuccess,
} from '../reducer';

export const mapToNotification = (data: firebase.firestore.DocumentData) => {
  if (data?.timestamp) {
    data.timestamp = data.timestamp.toDate();
  }

  if (data?.eventTimestamp) {
    data.eventTimestamp.toDate();
  }

  return data as Notification;
};

export const subscribeToNotifications =
  (onlyUnread = false): AppThunk =>
  async (dispatch, _getState, { firestoreSubscriptions, db, auth }) => {
    try {
      dispatch(subscribeToNotificationsStarted());

      const user = auth().currentUser;
      if (!user || !user.email) {
        throw new Error('user-is-not-logged');
      }

      firestoreSubscriptions.notificationsListener?.();

      const ref = db
        .collection(COLLECTION.USERS)
        .doc(user.uid)
        .collection(COLLECTION.NOTIFICATIONS)
        .where(
          'status',
          'in',
          onlyUnread
            ? [NotificationStatus.UNREAD]
            : [NotificationStatus.UNREAD, NotificationStatus.READ]
        )
        .orderBy('timestamp', 'desc')
        .limit(151);

      firestoreSubscriptions.notificationsListener = ref.onSnapshot(
        (snapshot) => {
          const list = snapshot.docs.map((item) =>
            mapToNotification({ ...item.data(), id: item.id })
          );
          dispatch(
            subscribeToNotificationsSuccess({
              filter: onlyUnread ? 'unread' : 'all',
              list,
              totalUnread: list.filter((item) => item.status === NotificationStatus.UNREAD).length,
            })
          );
        },
        (_e) => {
          dispatch(subscribeToNotificationsFailed());
        }
      );
    } catch (e) {
      dispatch(subscribeToNotificationsFailed());
    }
  };
