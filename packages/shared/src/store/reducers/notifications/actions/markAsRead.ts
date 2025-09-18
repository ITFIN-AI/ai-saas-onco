import { createAsyncThunk } from '@reduxjs/toolkit';
import { NotificationStatus } from '../../../../models/documents/notifications/NotificationCommon';
import { AsyncThunkCreator } from '../../../index';
import { NOTIFICATIONS_REDUCER_NAME } from '../types';
import { COLLECTION } from '../../../../firestore/collectionNames';

export const markAsRead = createAsyncThunk<void, string, AsyncThunkCreator<number>>(
  `${NOTIFICATIONS_REDUCER_NAME}/markAsRead`,
  async (notificationId, { rejectWithValue, extra: { auth, db } }) => {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('user-is-not-logged');
      }
      const ref = db
        .collection(COLLECTION.USERS)
        .doc(user.uid)
        .collection(COLLECTION.NOTIFICATIONS)
        .doc(notificationId);

      await ref.update({
        status: NotificationStatus.READ,
      });
    } catch (e) {
      const error = e as any;

      return rejectWithValue(error.message);
    }

    return;
  }
);
