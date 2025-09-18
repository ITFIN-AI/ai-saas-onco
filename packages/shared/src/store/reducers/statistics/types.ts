import {
  CreatorMonthStatsDocument,
  CreatorStatsDocument,
  FreeProductMonthStatsDocument,
  FreeProductStatsDocument,
  PaidProductMonthStatsDocument,
  PaidProductStatsDocument,
} from '../../../models/documents/Reports';
import { RequestStatus } from '../../../enums/requestStatus';

export const STATISTICS_REDUCER_NAME = 'Statistics';

export interface StatisticsReducer {
  currentMonthStats: CreatorMonthStatsDocument | null;
  currentMonthStatsStatus: null | RequestStatus;
  creatorStats: CreatorStatsDocument | null;
  creatorStatsStatus: null | RequestStatus;
  selectedProductStats: PaidProductStatsDocument | FreeProductStatsDocument | null;
  selectedProductMonthStats: PaidProductMonthStatsDocument | FreeProductMonthStatsDocument | null;
  selectedProductStatsStatus: null | RequestStatus;
  selectedProductMonthStatsStatus: null | RequestStatus;
}
