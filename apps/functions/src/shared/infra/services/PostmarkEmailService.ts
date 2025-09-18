import * as functions from 'firebase-functions';
import {
  EmailService,
  StandardEmailParams,
  TemplateEmailParams,
} from '../../services/EmailService';
const postmark = require('postmark');

interface Dependencies {
  logger: typeof functions.logger;
  postmarkApiKey: string;
  defaultSender: string;
  domain: string;
}

export class PostmarkEmailService implements EmailService {
  constructor(private dependencies: Dependencies) {}
  public async sendEmail({
    email,
    subject,
    from,
    replyTo,
    ...rest
  }: TemplateEmailParams | StandardEmailParams) {
    const { logger, postmarkApiKey, defaultSender, domain } = this.dependencies;
    try {
      const client = new postmark.ServerClient(postmarkApiKey);
      const mailOptions = {
        From: from || defaultSender,
        To: email,
        ReplyTo: replyTo,
        Subject: subject,
        MessageStream: 'outbound',
      };
      if ('templateId' in rest || 'templateAlias' in rest) {
        logger.debug('Sending email with template...');
        await client.sendEmailWithTemplate({
          ...mailOptions,
          ...('templateAlias' in rest ? { TemplateAlias: rest.templateAlias } : {}),
          TemplateModel: {
            domain,
            ...('dynamicTemplateData' in rest ? rest.dynamicTemplateData : {}),
          },
        });
      } else {
        logger.debug('Sending standard email...');
        await client.sendEmail({ ...mailOptions, TextBody: rest.body, HtmlBody: rest.html });
      }
    } catch (e) {
      logger.warn('Error when sending email by Postmark mailer', e.message);
      logger.warn('Error object', { e });
    }
  }
}
