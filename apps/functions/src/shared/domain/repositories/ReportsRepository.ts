import { AppStatsDocument } from '@akademiasaas/shared';

export interface ReportsRepository {
  upsertAppStatistics: (data: Partial<AppStatsDocument>) => Promise<void>;
  updateAppStatistics: (data: Partial<AppStatsDocument>) => Promise<void>;
}
