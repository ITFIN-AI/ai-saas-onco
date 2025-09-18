// Strict type for email template values
export type EmailTemplateValue = string | number | boolean | null | object;

// Type for email template data that only allows EmailTemplateValue
export type EmailDynamicTemplateData = Record<string, EmailTemplateValue>;

export interface StandardEmailParams {
  email: string;
  subject?: string;
  body?: string;
  replyTo?: string;
  from?: string;
  html?: string;
}

export type TemplateEmailParams = {
  email: string;
  subject?: string;
  replyTo?: string;
  from?: string;
  dynamicTemplateData?: EmailDynamicTemplateData;
  templateAlias: string;
};

export interface EmailService {
  sendEmail: (params: TemplateEmailParams | StandardEmailParams) => Promise<void>;
}
