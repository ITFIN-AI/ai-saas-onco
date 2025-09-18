import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IntegrationApiTokensReducer, INTEGRATION_API_TOKENS_REDUCER_NAME } from './types';
import { RequestStatus } from '../../../enums/requestStatus';
import { ApiTokenDocument } from '../../../models/documents';

const initialState: IntegrationApiTokensReducer = {
  error: null,
  status: null,
  data: null,
  showProductList: false,
};

const integrationApiTokensSlice = createSlice({
  name: INTEGRATION_API_TOKENS_REDUCER_NAME,
  initialState,
  reducers: {
    subscribeToApiTokensStarted(state) {
      state.status = RequestStatus.SUBSCRIBING;
      state.error = null;
    },
    subscribeToApiTokensSuccess(state, { payload }: PayloadAction<ApiTokenDocument[] | null>) {
      state.status = RequestStatus.SUBSCRIBED;
      state.data = payload;
    },
    subscribeToApiTokensFailed(state, { payload }: PayloadAction<string>) {
      state.status = RequestStatus.FAILED;
      state.error = payload;
    },
    unsubscribeFromApiTokens(state) {
      state.status = null;
      state.error = null;
      state.data = null;
    },
  },
});

export const {
  subscribeToApiTokensFailed,
  subscribeToApiTokensStarted,
  subscribeToApiTokensSuccess,
  unsubscribeFromApiTokens,
} = integrationApiTokensSlice.actions;

export default integrationApiTokensSlice.reducer;
