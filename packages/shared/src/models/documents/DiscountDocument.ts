import { Currency } from './Currency';

export interface DiscountDocument {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  currency: Currency | null;
  products: { id: string }[];
  prices: null | { id: string; productId: string }[];
  status: DiscountStatus;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  quantityLimit: null | number;
  limitRange: {
    from: Date;
    to: Date | null;
  } | null;
  used: number;
}

export enum DiscountStatus {
  Active = 'active',
  Suspended = 'suspended',
  Deactivated = 'deactivated',
  Archive = 'archive',
}

export enum DiscountType {
  Percent = 'percent',
  Number = 'number',
}
