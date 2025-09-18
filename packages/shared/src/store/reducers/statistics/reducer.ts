import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { STATISTICS_REDUCER_NAME, StatisticsReducer } from './types';
import { fetchCreatorStats } from './actions/fetchCreatorStats';
import { fetchCurrentMonthStats } from './actions/fetchCurrentMonthStats';
import { RequestStatus } from '../../../enums/requestStatus';
import { CreatorStatsDocument } from '../../../models/documents/Reports';

const initialState: StatisticsReducer = {
  creatorStats: null,
  creatorStatsStatus: null,
  currentMonthStats: null,
  currentMonthStatsStatus: null,
  selectedProductMonthStats: null,
  selectedProductMonthStatsStatus: null,
  selectedProductStats: null,
  selectedProductStatsStatus: null,
};

const statisticsSlice = createSlice({
  name: STATISTICS_REDUCER_NAME,
  initialState,
  reducers: {
    subscribeToCreatorStatsStarted(state) {
      if (!state.creatorStats) {
        state.creatorStatsStatus = RequestStatus.FETCHING;
      }
    },
    subscribeToCreatorStatsSuccess(state, { payload }: PayloadAction<CreatorStatsDocument | null>) {
      state.creatorStats = payload;
      state.creatorStatsStatus = RequestStatus.SUBSCRIBED;
    },
    subscribeToCreatorStatsFailed(state) {
      state.creatorStatsStatus = RequestStatus.FAILED;
    },
    unsubscribeFromCreatorStats(state) {
      state.creatorStatsStatus = null;
    },
    clearProductStats(state) {
      state.selectedProductMonthStats = null;
      state.selectedProductMonthStatsStatus = null;
      state.selectedProductStats = null;
      state.selectedProductStatsStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCreatorStats.pending, (state) => {
      if (!state.creatorStats) {
        state.creatorStatsStatus = RequestStatus.FETCHING;
      }
    });
    builder.addCase(fetchCreatorStats.fulfilled, (state, { payload }) => {
      state.creatorStatsStatus = RequestStatus.SUCCESS;
      state.creatorStats = payload;
    });
    builder.addCase(fetchCreatorStats.rejected, (state) => {
      state.creatorStatsStatus = RequestStatus.FAILED;
    });
    builder.addCase(fetchCurrentMonthStats.pending, (state) => {
      if (!state.currentMonthStats) {
        state.currentMonthStatsStatus = RequestStatus.FETCHING;
      }
    });
    builder.addCase(fetchCurrentMonthStats.fulfilled, (state, { payload }) => {
      state.currentMonthStatsStatus = RequestStatus.SUCCESS;
      state.currentMonthStats = payload;
    });
    builder.addCase(fetchCurrentMonthStats.rejected, (state) => {
      state.currentMonthStatsStatus = RequestStatus.FAILED;
    });
  },
});

export const {
  subscribeToCreatorStatsStarted,
  subscribeToCreatorStatsSuccess,
  subscribeToCreatorStatsFailed,
  unsubscribeFromCreatorStats,
  clearProductStats,
} = statisticsSlice.actions;

export default statisticsSlice.reducer;
