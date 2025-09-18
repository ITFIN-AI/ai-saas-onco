import { TaskService } from 'shared/services/TaskService';
import * as functions from 'firebase-functions';
import type { CloudTasksClient as CloudTasksClientType } from '@google-cloud/tasks';
import { google } from '@google-cloud/tasks/build/protos/protos';

const { CloudTasksClient } = require('@google-cloud/tasks').v2;

import dayjs from 'dayjs';

interface Dependencies {
  logger: typeof functions.logger;
  location: string;
  projectId: string;
  host: string;
}

export class GoogleTaskService implements TaskService {
  private taskClient: CloudTasksClientType;

  private orderQueue = 'orders-queue';
  constructor(private dependencies: Dependencies) {
    this.taskClient = new CloudTasksClient();
  }

  async addOrderTask(order: {
    orderId: string;
    ownerId: string;
    priceId: string;
    productId: string;
  }): Promise<string | null> {
    const { projectId, location, logger, host } = this.dependencies;

    try {
      const parent = this.taskClient.queuePath(projectId, location, this.orderQueue);

      logger.debug(`Adding order task to queue ${this.orderQueue} for order ${order.orderId}`, {
        parent,
        projectId,
      });

      const task: google.cloud.tasks.v2.ITask = {
        httpRequest: {
          httpMethod: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          url: `${host}/products-verify/update-order`,
          body: Buffer.from(
            JSON.stringify({
              ...order,
            })
          ).toString('base64'),
        },
        scheduleTime: {
          seconds: dayjs().add(15, 'minute').unix(),
        },
      };

      const request: google.cloud.tasks.v2.ICreateTaskRequest = {
        parent,
        task,
      };

      logger.debug('Creating task:', { task });
      const [response] = await this.taskClient.createTask(request);
      const name = response.name;
      logger.info(`Created task ${name} for order ${order.orderId}`);

      return name || null;
    } catch (e) {
      logger.error(`Error when trying add order task: ${e.message}`);

      return null;
    }
  }
}
