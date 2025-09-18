import { BaseDocument } from './BaseDocument';
import { ProductChargeType } from '../../enums/productEnums';
import { SubscriptionPlan } from './Subscriptions';
import { RequiresAction } from './OrderDocument';

export type ReportCurrency = 'PLN' | 'USD' | 'GBP' | 'EUR';

export interface SubscribersStats {
  totalNumberOfFreeSubscribers: number;
  totalNumberOfPaidSubscribers: number;
  totalNumberOfImportedFreeSubscribers: number;
  totalNumberOfImportedPaidSubscribers: number;
  totalNumberOfArchivedSubscribers: number;
  totalUploadedBytes: number;
}

export interface AppStatsDocument extends SubscribersStats {
  createdAt: Date;
  updatedAt: Date;
  totalNumberOfUsers: number;
  totalNumberOfMailings: number;
  totalNumberOfFreeMailings: number;
  totalNumberOfPaidMailings: number;
}

export interface CreatorStatsDocument extends SubscribersStats {
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  totalNumberOfProducts: number;
  totalNumberOfOneTimeTransactions: number;
  totalAmountOfEarnedMoney: Record<ReportCurrency, number>;
  requiresAction?: RequiresAction | null;
  currentTier: SubscriptionPlan | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatorMonthStatsDocument {
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  numberOfFreeSubscribers: number;
  numberOfPaidSubscribers: number;
  numberOfImportedFreeSubscribers: number;
  numberOfImportedPaidSubscribers: number;
  numberOfTransactions: number;
  numberOfOneTimeTransactions: number;
  numberOfTransactionsPerProduct: Record<
    string,
    {
      name: string;
      transactions: number;
      amountOfEarnedMoney: Record<ReportCurrency, number> | 'free';
    }
  >;
  amountOfEarnedMoney: Record<ReportCurrency, number>;
  monthYear: string;
  monthYearDate: Date;
}

export interface PaidProductStatsDocument extends BaseDocument {
  creatorId: string;
  creatorName: string;
  productName: string;
  productId: string;
  type: ProductChargeType.Paid;
  numberOfPurchaseTransactions: number;
  numberOfNextCycleTransactions: number;
  numberOfActiveSubscribers: number;
  numberOfArchivedSubscribers: number;
  numberOfImportedSubscribers: number;
  totalNumberOfTransactions: number;
  amountOfEarnedMoney: Record<ReportCurrency, number>;
}

// in format D-M
export type DayMonth = `${number}-${number}`;

export interface PaidProductMonthStatsDocument extends BaseDocument {
  creatorId: string;
  creatorName: string;
  productId: string;
  productName: string;
  type: ProductChargeType.Paid;
  numberOfNewSubscribers: number;
  numberOfImportedSubscribers: number;
  totalNumberOfTransactions: number;
  numberOfPurchaseTransactions: number;
  numberOfNextCycleTransactions: number;
  amountOfEarnedMoney: Record<ReportCurrency, number>;
  monthYear: string;
  monthYearDate: number;
  byDay: Record<
    DayMonth,
    {
      totalNumberOfTransactions: number;
      numberOfPurchaseTransactions: number;
      numberOfNextCycleTransactions: number;
      subscribers: number;
      amountOfEarnedMoney: Record<ReportCurrency, number>;
    }
  >;
}

export interface FreeProductStatsDocument extends BaseDocument {
  creatorId: string;
  creatorName: string;
  productId: string;
  productName: string;
  type: ProductChargeType.Free;
  numberOfSubscribers: number;
  numberOfImportedSubscribers: number;
}

export interface FreeProductMonthStatsDocument extends BaseDocument {
  creatorId: string;
  creatorName: string;
  productId: string;
  productName: string;
  type: ProductChargeType.Free;
  numberOfNewSubscribers: number;
  numberOfImportedSubscribers: number;
  monthYear: string;
  monthYearDate: number;
  byDay: Record<
    DayMonth,
    {
      subscribers: number;
    }
  >;
}
