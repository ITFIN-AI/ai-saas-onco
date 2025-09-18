import firebase from 'firebase/compat/app';
import 'firebase/compat/analytics';
import posthog from 'posthog-js';

import {
  AnalyticsProperties,
  AnalyticsService,
  AnalyticsUserProperties,
} from '@akademiasaas/shared';

type Dependecies = {
  postHogApiKey: string;
};

export class NoOpAnalyticsService implements AnalyticsService {
  track(_event_name: string, _properties?: AnalyticsProperties): void {}
  identify(_userId: string, _userProperties?: AnalyticsUserProperties): void {}
  updateUserProperties(_userId: string, _userProperties: AnalyticsUserProperties): void {}
}

export class WebAnalyticsService implements AnalyticsService {
  firebase: firebase.analytics.Analytics;
  posthog: typeof posthog;
  isLocalhost: boolean = window.location.hostname === 'localhost';

  constructor(dependencies: Dependecies) {
    if (!this.isLocalhost) {
      posthog.init(dependencies.postHogApiKey, {
        api_host: 'https://eu.posthog.com',
        autocapture: !this.isLocalhost,
        capture_pageleave: !this.isLocalhost,
        capture_pageview: !this.isLocalhost,
        capture_performance: !this.isLocalhost,
      });
    }

    this.firebase = firebase.analytics();
    this.posthog = posthog;
  }

  track(event_name: string, properties?: AnalyticsProperties): void {
    this.firebase.logEvent(event_name, properties);
    if (!this.isLocalhost) {
      this.posthog.capture(event_name, properties);
    }
  }

  identify(userId: string, userProperties?: AnalyticsUserProperties) {
    if (!this.isLocalhost) {
      this.firebase.setUserId(userId);
      this.posthog.identify(userId, {
        email: userProperties?.email || null,
        name: userProperties?.name || null,
      });
    }
  }

  updateUserProperties(userId: string, userProperties: AnalyticsUserProperties): void {
    if (!this.isLocalhost) {
      this.firebase.setUserProperties({ userId, email: userProperties.email || null });
      posthog.capture('update_user_properties', {
        $set: { email: userProperties.email || null },
      });
    }
  }
}
