import 'react-redux';
import { AppStore } from '@akademiasaas/shared';

declare module 'react-redux' {
  export interface DefaultRootState extends AppStore { }
}
