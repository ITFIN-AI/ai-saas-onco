import { createAsyncThunk } from '@reduxjs/toolkit';
import { AsyncThunkCreator } from '../../../index';
import { STATISTICS_REDUCER_NAME } from '../types';
import { COLLECTION } from '../../../../firestore/collectionNames';
import { firestoreDateMapper } from '../../../../helpers/firestoreDateMapper';
import { CreatorStatsDocument } from '../../../../models/documents/Reports';

export const fetchCreatorStats = createAsyncThunk<
  CreatorStatsDocument | null,
  void,
  AsyncThunkCreator<number>
>(
  `${STATISTICS_REDUCER_NAME}/fetchCreatorStats`,
  async (_, { rejectWithValue, extra: { auth, db } }) => {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('user-is-not-logged');
      }
      const ref = db.collection(COLLECTION.REPORTS).doc(user.uid);

      const doc = await ref.get();

      return doc.exists ? firestoreDateMapper<CreatorStatsDocument>(doc) : null;
    } catch (e) {
      const error = e as any;

      return rejectWithValue(error.message);
    }
  }
);
