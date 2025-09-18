import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Badge,
  Button,
  Card,
  Descriptions,
  Empty,
  Grid,
  message,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useAppDispatch } from '~/initializeStore';
import {
  AppStore,
  enumValues,
  subscriptionActions,
  SubscriptionPlan,
  UserSubscriptionInterval,
  getPlanDetails,
  planDetailsFromDocument,
} from '@akademiasaas/shared';
import classNames from 'classnames';
import { ClockCircleOutlined, WalletOutlined } from '@ant-design/icons';
import UserInvoiceData from '~/pages/Subscription/InvoiceData';
import UserStatistics from './UserStatistics';
import ConfirmModal from '~/components/ConfirmModal/ConfirmModal';
import Stripe from 'stripe';
import { FeaturesList } from './FeaturesList';
import { PRICING_PAGE_URL } from '@akademiasaas/shared/src/constants/urls';

const { Title } = Typography;

interface OwnProps {}

type Props = OwnProps;

const DATE_FORMAT = 'DD.MM.YYYY (HH:mm)';

const SUBSCRIPTION_ERROR = {
  NO_PAYMENT_SOURCE: 'This customer has no attached payment source or default payment method.',
};

export const statusMapper = {
  active: 'success',
  paid: 'success',
  imported: 'success',
  past_due: 'warning',
  incomplete_expired: 'warning',
  trialing: 'success',
  incomplete: 'processing',
  canceled: 'warning',
  unpaid: 'error',
  expired: 'error',
} as const;

const Subscription: FunctionComponent<Props> = () => {
  const { t } = useTranslation(['subscription']);
  const { lg } = Grid.useBreakpoint();
  const userDetails = useSelector((store: AppStore) => store.user.details);
  const subscription = useSelector((store: AppStore) => store.subscription.data);
  const dispatch = useAppDispatch();
  const userPlanDetails = planDetailsFromDocument(userDetails?.subscription?.plan);
  const [selectedPlan, setPlan] = useState<SubscriptionPlan>(
    userPlanDetails?.name || SubscriptionPlan.Basic
  );
  const [selectedInterval, setInterval] = useState<UserSubscriptionInterval>('month');
  const [fetchingClientSession, toggleFetchingSessions] = useState(false);
  const subscriptionInterval = subscription?.items.data[0].plan.interval;
  const [activatingTrial, setActivatingTrial] = useState(false);
  const subscriptionPrice = (subscription?.items.data[0].price.unit_amount ?? 0) / 100;
  const [changingPlan, toggleChangingPlan] = useState(false);
  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [invoice, setInvoice] = useState<Stripe.Response<Stripe.Invoice> | null>(null);

  const selectedPlanDetails = getPlanDetails(selectedPlan);

  const plans = enumValues(SubscriptionPlan);

  const subscriptionOptions = useMemo(() => {
    return [
      {
        label: t<string>(`plan.${SubscriptionPlan.Free}`),
        value: SubscriptionPlan.Free,
      },
      {
        label: t<string>(`plan.${SubscriptionPlan.Basic}`),
        value: SubscriptionPlan.Basic,
      },
      {
        label: t<string>(`plan.${SubscriptionPlan.Standard}`),
        value: SubscriptionPlan.Standard,
      },
      {
        label: t<string>(`plan.${SubscriptionPlan.Professional}`),
        value: SubscriptionPlan.Professional,
      },
    ];
  }, [t]);

  const status = userDetails?.subscription?.requiresAction?.status;

  const disabledFreePlan =
    selectedPlan === SubscriptionPlan.Free && userPlanDetails?.name !== 'free';

  useEffect(() => {
    if (subscription && status !== 'reached_limit') {
      setInterval((subscription.items.data[0].plan.interval as 'month' | 'year') || 'month');
      setPlan(
        (subscription.items.data[0].price.metadata.levels as SubscriptionPlan.Basic) ||
          SubscriptionPlan.Basic
      );
    }
  }, [subscription, status]);

  useEffect(() => {
    if (status === 'reached_limit') {
      setInterval((subscription?.items.data[0].plan.interval as 'month' | 'year') || 'month');
      setPlan(
        userDetails?.subscription?.requiresAction?.shouldUpgradeTo || SubscriptionPlan.Standard
      );
    }
  }, [status, subscription?.items.data, userDetails?.subscription?.requiresAction]);

  useEffect(() => {
    return () => {
      dispatch(subscriptionActions.unsubscribeFromSubscription());
    };
  }, [dispatch]);

  const subscriptionId = userDetails?.subscription?.id;

  useEffect(() => {
    if (subscriptionId) {
      dispatch(subscriptionActions.subscribeToSubscription(subscriptionId));
    }
  }, [dispatch, subscriptionId]);

  const createBillingSession = async () => {
    try {
      toggleFetchingSessions(true);

      const result = await dispatch(subscriptionActions.createBillingCustomerSession()).unwrap();

      window.location.replace(result.url);
    } catch (e) {
      toggleFetchingSessions(false);
      message.error(t<string>('errors.createBillingSession'));
    }
  };

  const checkSubscriptionInvoice = async () => {
    toggleConfirmModal(true);
    const result = await dispatch(
      subscriptionActions.checkSubscriptionInvoice({
        interval: selectedInterval,
        plan: selectedPlan,
      })
    ).unwrap();
    setInvoice(result);
  };

  const changePlan = async () => {
    toggleChangingPlan(true);
    message.loading({ key: 'load', content: t<string>('changingPlan'), duration: 0 });
    try {
      await dispatch(
        subscriptionActions.changeSubscriptionPlan({
          interval: selectedInterval,
          plan: selectedPlan,
        })
      ).unwrap();
      message.destroy('load');
      message.success(t<string>('changedPlan'));
      toggleChangingPlan(false);
    } catch (e) {
      message.destroy('load');
      if (e instanceof Error && e.message === SUBSCRIPTION_ERROR.NO_PAYMENT_SOURCE) {
        message.error(t<string>('noPaymentMethod'), 5);
      } else {
        message.error(t<string>('errorWhenChangingPlan'));
      }
      toggleChangingPlan(false);
    }
  };

  const activateSubscription = async () => {
    setActivatingTrial(true);
    await dispatch(subscriptionActions.activateTrial());
    setActivatingTrial(false);
  };

  const subscriptionRegion = !userDetails?.country || userDetails.country === 'PL' ? 'pl' : 'intl';

  const showInfoAboutLackOfPaymentMethod =
    userDetails?.subscription && !userDetails.subscription.defaultPaymentMethod;

  if (!userDetails?.subscription) {
    return (
      <Card title={t<string>('title')}>
        <Empty
          image={<WalletOutlined style={{ fontSize: 35 }} />}
          imageStyle={{ height: 45 }}
          style={{ padding: '50px 0' }}
          description={<strong>{t<string>('freePlanWillBeAdded')}</strong>}
        >
          <Button type="primary" onClick={activateSubscription} loading={activatingTrial}>
            {t<string>('activateFreePlan')}
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>{t<string>('title')}</Title>
      </div>
      <Card>
        <Descriptions bordered layout={lg ? 'horizontal' : 'vertical'}>
          <Descriptions.Item span={3} label={t<string>('subscription.currentPlan')}>
            {userPlanDetails?.name && plans.includes(userPlanDetails?.name) ? (
              <Typography.Text strong>{t<string>(`plan.${userPlanDetails.name}`)}</Typography.Text>
            ) : (
              <Typography.Text strong>{t<string>('plan.custom')}</Typography.Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item span={3} label={t<string>('subscription.status')}>
            {userDetails?.subscription ? (
              <Space>
                <Badge
                  status={
                    statusMapper[userDetails.subscription.status as keyof typeof statusMapper]
                  }
                  text={t<string>(`subscriptionStatus.${userDetails.subscription.status}`)}
                />
                {userDetails.subscription.cancelAtPeriodEnd ? (
                  <Tag icon={<ClockCircleOutlined />}>
                    {t<string>('newsletters:subscription.endAt')}{' '}
                    {dayjs.unix(userDetails.subscription.currentPeriodEnd).format('DD.MM')}
                  </Tag>
                ) : null}
              </Space>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          {userPlanDetails?.name !== SubscriptionPlan.Free && (
            <Descriptions.Item span={3} label={t<string>('subscription.period')}>
              {userDetails?.subscription ? (
                <span>
                  {dayjs.unix(userDetails?.subscription.currentPeriodStart).format(DATE_FORMAT)}
                  {userDetails?.subscription.currentPeriodEnd
                    ? ` - ${dayjs
                        .unix(userDetails?.subscription.currentPeriodEnd)
                        .format(DATE_FORMAT)}`
                    : ''}
                </span>
              ) : (
                '-'
              )}
            </Descriptions.Item>
          )}
          {userDetails.invoiceData && (
            <Descriptions.Item span={3} label={t<string>('subscription.settings')}>
              <Space>
                <Button
                  type="link"
                  onClick={createBillingSession}
                  loading={fetchingClientSession}
                  style={{ marginLeft: -12 }}
                >
                  {t<string>('subscription.manageSubscription')}
                </Button>

                {userDetails?.subscription && !userDetails.subscription.defaultPaymentMethod ? (
                  <Alert showIcon type="warning" message={t<string>('addPaymentMethodWarning')} />
                ) : null}
              </Space>
            </Descriptions.Item>
          )}
        </Descriptions>

        {userPlanDetails && <UserStatistics currentPlanDetails={userPlanDetails} />}

        <UserInvoiceData
          user={userDetails}
          showAsAlert={userDetails?.subscription?.status !== 'active'}
        />

        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-2">
          <div className="sm:flex sm:flex-col sm:align-center">
            <div className="relative self-center mt-4 bg-gray-100 p-0.5 flex sm:mt-4">
              <button
                type="button"
                onClick={() => setInterval('month')}
                className={classNames(
                  'relative w-1/2 border-gray-200 shadow-sm py-2 text-sm font-medium text-gray-900 whitespace-nowrap focus:outline-none focus:z-10 sm:w-auto sm:px-8',
                  { 'bg-white border-2': selectedInterval === 'month' }
                )}
              >
                {t<string>(`plan.month`)}
              </button>
              <button
                type="button"
                onClick={() => setInterval('year')}
                className={classNames(
                  'relative w-1/2 border-gray-200 shadow-sm py-2 text-sm font-medium text-gray-900 whitespace-nowrap focus:outline-none focus:z-10 sm:w-auto sm:px-8',
                  { 'bg-white border-2': selectedInterval === 'year' }
                )}
              >
                {t<string>(`plan.year`)}
              </button>
            </div>
          </div>
          <div className="mt-10 flex justify-center">
            <div className="relative z-9 shadow-xl w-full max-w-xl">
              <div className="pointer-events-none absolute inset-0" aria-hidden="true" />
              <div className="bg-white px-6 pt-12 pb-6">
                <div>
                  <h3
                    className="text-center text-3xl font-semibold text-gray-900 sm:-mx-6"
                    id="tier-growth"
                  >
                    {plans.includes(selectedPlan)
                      ? t<string>(`plan.${selectedPlan}`)
                      : t<string>('plan.custom')}
                  </h3>
                  <div className="mt-6 flex items-center justify-center">
                    <span className="px-3 flex items-start text-5xl tracking-tight text-gray-900 sm:text-5xl">
                      <span className="font-bold">
                        {plans.includes(selectedPlan)
                          ? t<string>(
                              `plan.price.${subscriptionRegion}.${selectedInterval}.${selectedPlan}`
                            )
                          : subscriptionRegion === 'intl'
                            ? '$' + subscriptionPrice
                            : subscriptionPrice + ' PLN'}
                      </span>
                    </span>
                    <span className="text-2xl font-medium text-gray-500">
                      /{t<string>(`plan.monthly`)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-y-2 my-2">
                    {selectedPlan !== SubscriptionPlan.Free && (
                      <div className="flex items-center justify-center">
                        <p className="text-sm text-gray-500">
                          {t<string>(`plan.${selectedInterval}Desc`)}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-center">
                      <FeaturesList selectedTier={selectedPlan} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Select
                    value={plans.includes(selectedPlan) ? selectedPlan : t<string>('plan.custom')}
                    onSelect={(label, { value }) => {
                      setPlan(value);
                    }}
                    options={subscriptionOptions}
                    size="large"
                    className="w-8/12"
                  />
                </div>
                <div className="flex items-center justify-center mt-5">
                  <p className="text-center text-base mb-0">
                    <a href={`${PRICING_PAGE_URL}`} target="_blank" rel="noreferrer">
                      {t<string>('plan.seeFullPricing')}
                    </a>
                  </p>
                </div>
              </div>
              {disabledFreePlan ? (
                <div className="border-t-2 border-gray-100 pt-8 pb-8 px-6 bg-gray-50 sm:px-10 sm:py-10">
                  <div className="mt-4">
                    <div className="flex flex-col">
                      <Alert
                        showIcon
                        type="warning"
                        message={t<string>('cancelSubscriptionToDowngrade')}
                      />
                      <Button
                        className="mt-4"
                        onClick={createBillingSession}
                        loading={fetchingClientSession}
                        type="primary"
                        size="large"
                      >
                        {t<string>('subscription.manageSubscription')}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-t-2 border-gray-100 pt-8 pb-8 px-6 bg-gray-50 sm:px-10 sm:py-10">
                  <div className="mt-2">
                    {selectedPlan === userPlanDetails?.name &&
                    (!subscriptionInterval || selectedInterval === subscriptionInterval) ? (
                      <Button disabled={true} block type="primary" size="large">
                        {t<string>('currentPlan')}
                      </Button>
                    ) : (
                      <div className="shadow-md">
                        {showInfoAboutLackOfPaymentMethod ? (
                          <Alert
                            type="warning"
                            showIcon
                            message={
                              !userDetails.invoiceData
                                ? t<string>('addInvoiceData')
                                : t<string>('addDefaultPaymentMethod')
                            }
                          />
                        ) : (
                          <>
                            <Button
                              onClick={checkSubscriptionInvoice}
                              loading={changingPlan}
                              disabled={changingPlan}
                              block
                              type="primary"
                              size="large"
                            >
                              {userDetails.subscription === null
                                ? t<string>('activatePlan')
                                : t<string>('changePlan')}
                            </Button>
                            <ConfirmModal
                              onSave={changePlan}
                              saving={changingPlan}
                              open={showConfirmModal}
                              onClose={() => {
                                toggleConfirmModal(false);
                                setInvoice(null);
                              }}
                              modalTitle={t<string>('planChangeConfirmation')}
                              buttonTitle={
                                Number(selectedPlanDetails.clients) >
                                Number(userDetails?.subscription?.plan?.clients)
                                  ? t<string>('paymentPlanButton')
                                  : t<string>('changePlanButton')
                              }
                            >
                              <div className="p-4">
                                <h3
                                  className="text-center text-3xl font-semibold text-gray-900 sm:-mx-6"
                                  id="tier-growth"
                                >
                                  {plans.includes(selectedPlan)
                                    ? t<string>(`plan.${selectedPlan}`)
                                    : t<string>('plan.custom')}
                                </h3>
                                <div className="mt-6 flex items-center justify-center">
                                  <span className="px-3 flex items-start text-5xl tracking-tight text-gray-900 sm:text-5xl">
                                    <span className="font-bold">
                                      {plans.includes(selectedPlan)
                                        ? t<string>(
                                            `plan.price.${subscriptionRegion}.${selectedInterval}.${selectedPlan}`
                                          )
                                        : subscriptionRegion === 'intl'
                                          ? '$' + subscriptionPrice
                                          : subscriptionPrice + ' PLN'}
                                    </span>
                                  </span>
                                  <span className="text-2xl font-medium text-gray-500">
                                    /{t<string>(`plan.monthly`)}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-y-2 my-2">
                                  {selectedPlan !== SubscriptionPlan.Free && (
                                    <div className="flex items-center justify-center">
                                      <p className="text-sm text-gray-500">
                                        {t<string>(`plan.${selectedInterval}Desc`)}
                                      </p>
                                    </div>
                                  )}
                                  <div className="flex items-center justify-center">
                                    <FeaturesList selectedTier={selectedPlan} />
                                  </div>
                                  {userDetails?.subscription?.priceId ? (
                                    invoice &&
                                    invoice.total > 0 && (
                                      <div>
                                        <h4 className="text-center text-2xl font-semibold text-gray-900 sm:-mx-6">
                                          {t<string>('paymentTotal') +
                                            (invoice.currency === 'pln'
                                              ? (invoice.total / 100).toFixed(2).replace('.', ',') +
                                                ' ' +
                                                invoice.currency.toUpperCase()
                                              : (invoice.total / 100).toFixed(2) +
                                                ' ' +
                                                invoice.currency.toUpperCase())}
                                          <span style={{ fontSize: 14, marginLeft: 6 }}>
                                            brutto
                                          </span>
                                        </h4>
                                        {userDetails?.subscription?.currentPeriodEnd && (
                                          <h5 className="text-center text-md font-semibold text-gray-900 sm:-mx-6">
                                            {t<string>('paymentPeriod') +
                                              dayjs.unix(invoice.created).format(DATE_FORMAT) +
                                              ' - ' +
                                              dayjs
                                                .unix(userDetails?.subscription.currentPeriodEnd)
                                                .format(DATE_FORMAT)}
                                          </h5>
                                        )}
                                      </div>
                                    )
                                  ) : (
                                    <div>
                                      <h4 className="text-center text-2xl font-semibold text-gray-900 sm:-mx-6">
                                        {t<string>('paymentTotal') +
                                          1.23 *
                                            Number(
                                              t(
                                                `plan.price.${subscriptionRegion}.${selectedInterval}.${selectedPlan}`
                                              ).split(' ')[0]
                                            ) +
                                          ' ' +
                                          t(
                                            `plan.price.${subscriptionRegion}.${selectedInterval}.${selectedPlan}`
                                          ).split(' ')[1]}
                                        <span style={{ fontSize: 14, marginLeft: 6 }}>brutto</span>
                                      </h4>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </ConfirmModal>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default Subscription;
