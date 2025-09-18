import './index.css';
import './i18nextConfig';
import React from 'react';
import { ConfigProvider } from 'antd';
import * as Sentry from '@sentry/react';
import pl from 'antd/lib/locale/pl_PL';
import { appTheme } from '~/theme/appTheme';
import App from './App';
import reportWebVitals from './reportWebVitals';
import dayjs from 'dayjs';
import ErrorBoundary from '~/components/ErrorBoundary/ErrorBoundary';
import { createRoot } from 'react-dom/client';

import 'dayjs/locale/pl';
dayjs.locale('pl');

const sentryKey = import.meta.env.VITE_SENTRY_KEY;

if (sentryKey) {
  Sentry.init({
    dsn: sentryKey,
    environment: import.meta.env.VITE_ENV_NAME,
    release: '@akademiasaas/web-app@' + import.meta.env.APP_VERSION,
  });
}

const container = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ConfigProvider
        locale={pl}
        theme={{
          token: appTheme,
        }}
      >
        <App />
      </ConfigProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
