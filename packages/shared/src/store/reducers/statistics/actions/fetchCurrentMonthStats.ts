import { createAsyncThunk } from '@reduxjs/toolkit';
import { AsyncThunkCreator } from '../../../index';
import { STATISTICS_REDUCER_NAME } from '../types';
import { COLLECTION } from '../../../../firestore/collectionNames';
import { firestoreDateMapper } from '../../../../helpers/firestoreDateMapper';
import { CreatorMonthStatsDocument } from '../../../../models/documents/Reports';
import dayjs from 'dayjs';

export const fetchCurrentMonthStats = createAsyncThunk<
  CreatorMonthStatsDocument | null,
  void,
  AsyncThunkCreator<number>
>(
  `${STATISTICS_REDUCER_NAME}/fetchCurrentMonthStats`,
  async (_, { rejectWithValue, extra: { auth, db } }) => {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('user-is-not-logged');
      }

      const today = dayjs();
      const ref = db
        .collection(COLLECTION.REPORTS)
        .doc(user.uid)
        .collection(COLLECTION.STATS_PER_MONTH)
        .doc(today.format('YYYY-M'));

      const doc = await ref.get();

      return doc.exists ? firestoreDateMapper<CreatorMonthStatsDocument>(doc) : null;
    } catch (e) {
      const error = e as any;

      return rejectWithValue(error.message);
    }
  }
);
