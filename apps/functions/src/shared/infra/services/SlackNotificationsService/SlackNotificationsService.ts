import axios from 'axios';
import { BusinessNotificationsService } from 'shared/services/BusinessNotificationsService';
import * as functions from 'firebase-functions';
import { eventMapper } from './eventMapper';
import { BusinessEventType } from '@akademiasaas/shared';

interface Dependencies {
  logger: typeof functions.logger;
  slackChannel: string;
  slackUrl: string;
  environmentName: string;
}

export class SlackNotificationsService implements BusinessNotificationsService {
  constructor(private dependencies: Dependencies) { }
  public async sendMessage(text: string, eventType: BusinessEventType) {
    const { environmentName, slackChannel, slackUrl, logger } = this.dependencies;
    logger.debug(
      `Start sending message about event ${eventType} to slack channel ${slackChannel} for ${environmentName} environment`
    );
    try {
      await axios({
        method: 'post',
        url: slackUrl,
        headers: { 'content-type': 'application/json' },
        data: {
          text: `[${environmentName}] ${text}`,
          username: eventMapper[eventType].name,
          mrkdwn: true,
          channel: slackChannel,
        },
      });
      logger.info(`Successfully sent message for channel ${slackChannel}`);
    } catch (e) {
      logger.error(
        `Error occurred when trying send message to ${slackChannel} for ${environmentName} environment`,
        e
      );
    }
  }

}
