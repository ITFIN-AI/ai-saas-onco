export interface EnvConfig {
  environmentName: string;
  fakturownia: {
    apiKey: string;
    apiUrl: string;
    departmentId: string;
  };
  domain: string;
  secretProjectManagerId: string;
  pubsub: {
    businessEvents: string;
    invoicesEvents: string;
    reports: string;
    admin: string;
  };
  postmark: {
    apiKey: string;
    defaultSender: string;
  };
  slack: {
    url: string;
    channel: string;
  };
  stripe: {
    apiKey: string;
    clientId: string;
    webhookSecret: string;
    productId: string;
  };
  projectId: string;
  api: {
    jwtPrivateKey: string;
  };
  redis: {
    url: string;
    token: string;
  };
}
