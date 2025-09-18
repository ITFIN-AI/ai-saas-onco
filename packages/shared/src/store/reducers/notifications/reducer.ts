import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationsReducer, NOTIFICATIONS_REDUCER_NAME, NotificationAction } from './types';
import { RequestStatus } from '../../../enums/requestStatus';
import { markAsRead } from './actions/markAsRead';
import { Notification } from '../../../models/documents/notifications';
const initialState: NotificationsReducer = {
  listStatus: null,
  totalUnread: 0,
  notifications: [],
  performingAction: null,
  filter: 'all',
};

const reducerSlice = createSlice({
  initialState,
  name: NOTIFICATIONS_REDUCER_NAME,
  reducers: {
    subscribeToNotificationsStarted(state) {
      state.listStatus = RequestStatus.SUBSCRIBING;
    },
    subscribeToNotificationsSuccess(
      state,
      {
        payload,
      }: PayloadAction<{
        list: Notification[];
        totalUnread: number;
        filter: 'all' | 'unread';
      }>
    ) {
      state.listStatus = RequestStatus.SUBSCRIBED;
      state.notifications = payload.list;
      state.totalUnread = payload.totalUnread;
      state.filter = payload.filter;
    },
    subscribeToNotificationsFailed(state) {
      state.listStatus = RequestStatus.FAILED;
    },
    unsubscribeFromNotifications(state) {
      state.listStatus = null;
      state.notifications = [];
      state.totalUnread = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(markAsRead.pending, (state, { meta }) => {
      state.performingAction = {
        action: NotificationAction.MarkAsRead,
        notificationId: meta.arg,
      };
    });
    builder.addCase(markAsRead.fulfilled, (state) => {
      state.performingAction = null;
    });
    builder.addCase(markAsRead.rejected, (state) => {
      state.performingAction = null;
    });
  },
});

export const {
  subscribeToNotificationsFailed,
  subscribeToNotificationsStarted,
  subscribeToNotificationsSuccess,
  unsubscribeFromNotifications,
} = reducerSlice.actions;
export default reducerSlice.reducer;
