import { BaseDocument } from './BaseDocument';

export interface ApiTokenDocument extends BaseDocument {
  id: string;
  name: string;
  uid: string;
  expiresAt: Date | null;
}
