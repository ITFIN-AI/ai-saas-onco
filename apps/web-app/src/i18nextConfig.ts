import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import detector from 'i18next-browser-languagedetector';

import { translations } from '@akademiasaas/shared';

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    resources: translations,
    fallbackLng: ['en', 'pl'],
    defaultNS: 'common',
    ns: ['common', 'auth', 'dashboard', 'settings', 'subscription'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      transSupportBasicHtmlNodes: true,
    },
  });

export default i18n;
