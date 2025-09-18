import { createAsyncThunk } from '@reduxjs/toolkit';
import { AsyncThunkCreator } from '../../../index';
import { NOTIFICATIONS_REDUCER_NAME } from '../types';
import { COLLECTION } from '../../../../firestore/collectionNames';
import { splitIntoChunks } from '../../../../helpers/splitIntoChunks';
import { BATCH_SIZE_LIMIT } from '../../../../constants/firestore';
import { NotificationStatus } from '../../../../models/documents';

export const markAllAsRead = createAsyncThunk<void, void, AsyncThunkCreator<number>>(
  `${NOTIFICATIONS_REDUCER_NAME}/markAllAsRead`,
  async (_, { rejectWithValue, extra: { auth, db } }) => {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('user-is-not-logged');
      }
      const ref = db
        .collection(COLLECTION.USERS)
        .doc(user.uid)
        .collection(COLLECTION.NOTIFICATIONS)
        .where('status', '==', NotificationStatus.UNREAD);

      const allUnread = await ref.get();

      const chunks = splitIntoChunks(allUnread.docs, BATCH_SIZE_LIMIT);

      for (const chunk of chunks) {
        const batch = db.batch();
        chunk.forEach((doc) => {
          batch.update(doc.ref, {
            status: NotificationStatus.READ,
          });
        });

        await batch.commit();
      }
    } catch (e) {
      const error = e as any;

      return rejectWithValue(error.message);
    }

    return;
  }
);
