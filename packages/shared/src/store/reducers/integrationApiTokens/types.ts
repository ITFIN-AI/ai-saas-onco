import { RequestStatus } from '../../../enums/requestStatus';
import { ApiTokenDocument } from '../../../models/documents';

export interface IntegrationApiTokensReducer {
  status: null | RequestStatus;
  data: null | ApiTokenDocument[];
  error: null | string;
  showProductList: boolean;
}

export const INTEGRATION_API_TOKENS_REDUCER_NAME = 'IntegrationApiTokens';
