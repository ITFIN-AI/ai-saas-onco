import { ApiTokenDocument } from '@akademiasaas/shared';

export interface ApiTokensRepository {
  saveApiToken: (uid: string, token: ApiTokenDocument) => Promise<void>;
  findApiTokenById: (uid: string, tokenId: string) => Promise<ApiTokenDocument | null>;
  deleteApiToken: (uid: string, tokenId: string) => Promise<void>;
}
