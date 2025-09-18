import * as functions from 'firebase-functions';
import { PubSub } from '@google-cloud/pubsub';
import {
  BusinessEvent,
  DEFAULT_FIREBASE_REGION,
  EMAIL_TEMPLATE_ALIASES,
  SubscriptionEventType,
  SubscriptionPlan,
  UserEventType,
} from '@akademiasaas/shared';
import { SlackNotificationsService } from 'shared/infra/services/SlackNotificationsService/SlackNotificationsService';
import { FirebaseEventRepository } from 'shared/infra/repositories/FirebaseEventRepository';
import { PostmarkEmailService } from 'shared/infra/services/PostmarkEmailService';
import { FirebaseUsersRepository } from 'shared/infra/repositories/FirebaseUsersRepository';
import { env, db } from 'config';

const eventsRepository = new FirebaseEventRepository({ db });
const usersRepository = new FirebaseUsersRepository({ db });

export const pubsub = new PubSub();

const emailService = new PostmarkEmailService({
  logger: functions.logger,
  postmarkApiKey: env.postmark.apiKey,
  defaultSender: env.postmark.defaultSender,
  domain: env.domain,
});

const businessNotifications = new SlackNotificationsService({
  logger: functions.logger,
  environmentName: env.environmentName,
  slackChannel: env.slack.channel,
  slackUrl: env.slack.url,
});

export const eventsFanOut = functions
  .region(DEFAULT_FIREBASE_REGION)
  .pubsub.topic(env.pubsub.businessEvents)
  .onPublish(async (message) => {
    const event: BusinessEvent | null = message.data
      ? JSON.parse(Buffer.from(message.data, 'base64').toString())
      : null;
    const { logger } = functions;
    logger.debug('Message body:', event, message.attributes);

    if (!event?.eventName) {
      logger.warn('Incorrect error without event name');

      return;
    }
    if (event.eventName === SubscriptionEventType.ActivatedNewTrialSubscription) {
      await businessNotifications.sendMessage(
        `:fire: Użytkownik ${event.payload.name} / ${event.payload.email} aktywował darmowy plan. Kraj: ${event.payload.country} / waluta subskrypcji ${event.payload.currency}`,
        event.eventName
      );
    }

    if (event.eventName === SubscriptionEventType.InvoicePaid && event.payload.amount) {
      await businessNotifications.sendMessage(
        `:tada: Użytkownik ${event.payload.email} opłacił dostęp do aplikacji (${
          event.payload.billingReason
        }). Kwota: ${event.payload.amount} ${event.payload.currency.toUpperCase()}. Plan: ${
          event.payload.interval
        } / ${event.payload.plan}`,
        event.eventName
      );

      await pubsub.topic(env.pubsub.invoicesEvents).publishJSON(event, {
        eventName: event.eventName,
        eventId: event.eventId,
        eventDomain: env.domain,
      });
    }

    if (event.eventName === SubscriptionEventType.InvoicePaymentFailed) {
      await businessNotifications.sendMessage(
        `:warning: Użytkownik ${event.payload.email} nieopłacił dostępu do aplikacji (${
          event.payload.billingReason
        }). Kwota: ${event.payload.amount} ${event.payload.currency.toUpperCase()}. Plan: ${
          event.payload.interval
        } / ${event.payload.plan}`,
        event.eventName
      );

      const user = await usersRepository.findUserById(event.payload.userId);

      await emailService.sendEmail({
        templateAlias: EMAIL_TEMPLATE_ALIASES.APP_PAYMENT_FAILED,
        email: user?.contactEmail ?? user?.email ?? event.payload.email,
        dynamicTemplateData: {
          subscriptionSettingsUrl: `${env.domain}/subscription`,
          en: user?.lang === 'en',
        },
      });
    }

    if (event.eventName === SubscriptionEventType.ChangedCurrentPlan) {
      const newPrice =
        event.payload.plan === SubscriptionPlan.Free
          ? 'darmowa'
          : `${event.payload.amount} ${event.payload.currency.toUpperCase()}`;
      await businessNotifications.sendMessage(
        `:fire: Użytkownik ${event.payload.email} zmienił aktywna subskrypcje z ${event.payload.previous.interval} / ${event.payload.previous.plan} na ${event.payload.interval} / ${event.payload.plan}. Cena nowej subskrypcji: ${newPrice}`,
        event.eventName
      );
    }

    if (event.eventName === SubscriptionEventType.CancelSubscription) {
      await businessNotifications.sendMessage(
        `:warning: Użytkownik ${event.payload.email} anulował aktywna subskrypcje ${event.payload.interval} / ${event.payload.plan}.`,
        event.eventName
      );
    }

    if (event.eventName === SubscriptionEventType.EndOfSubscription) {
      await businessNotifications.sendMessage(
        `:red_circle: Użytkownik ${event.payload.email} zakończył płatną subskrypcje ${event.payload.interval} / ${event.payload.plan}.`,
        event.eventName
      );
    }

    if (event.eventName === SubscriptionEventType.ReachedPlanLimits) {
      await businessNotifications.sendMessage(
        `:warning: Użytkownik ${event.payload.email} osiągnął limit dla swojej subskrypcji: ${
          event.payload.currentSubscription?.plan || 'Brak aktywnej'
        }. Proponowany następny plan to ${event?.payload.nextPlanProposal}.`,
        event.eventName
      );
    }

    if (event.eventName === SubscriptionEventType.PlanLimitsSatisfied) {
      await businessNotifications.sendMessage(
        `:recycle: Użytkownik ${event.payload.email} nie przekracza już limitu swojej subskrybcji: ${event.payload.plan}.`,
        event.eventName
      );
    }

    if (event.eventName === UserEventType.UserCreated) {
      const userData = await usersRepository.findUserById(event.payload.userId);
      if (userData) {
        await businessNotifications.sendMessage(
          `:new: Użytkownik ${userData.firstName} ${userData.lastName} ${event.payload.email} zarejestrował się`,
          event.eventName
        );
      }
    }

    await eventsRepository.saveEvent(event);
    logger.info(`Saved new event ${event.eventId} of type ${event.eventName} in events collection`);
  });
