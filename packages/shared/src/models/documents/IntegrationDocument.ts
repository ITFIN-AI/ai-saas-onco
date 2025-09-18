import { ProductFee } from '../domains/ProductFee';
import { BaseDocument } from './BaseDocument';

export interface IntegrationDocument extends BaseDocument {
  ownerId: string;
  ownerEmail: string;
  fees?: {
    [productId: string]: ProductFee;
  };
}
