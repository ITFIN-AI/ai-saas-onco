import { Action, combineReducers } from '@reduxjs/toolkit';
import { userReducer } from './user';
import { AppStore } from '../index';
import { notificationsReducer } from './notifications';
import { subscriptionReducer } from './subscription';
import { integrationApiTokensReducer } from './integrationApiTokens';
import { statisticsReducer } from './statistics';

const rootReducer = combineReducers<AppStore>({
  user: userReducer,
  notifications: notificationsReducer,
  statistics: statisticsReducer,
  integrationApiTokens: integrationApiTokensReducer,
  subscription: subscriptionReducer,
});

const LOG_OUT_ACTION = 'User/logOutSuccess';

export const createRootReducer = (state: AppStore | undefined, action: Action<string>) => {
  let newState = state;
  if (action.type === LOG_OUT_ACTION) {
    newState = undefined;
  }

  return rootReducer(newState, action);
};

export default rootReducer;
