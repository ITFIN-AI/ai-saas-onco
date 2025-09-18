import { useSelector } from 'react-redux';
import { AppStore } from '@akademiasaas/shared';
import { USER_FEATURES, UserFeatures } from '@akademiasaas/shared';

export const useUserFeatures = () => {
  const details = useSelector((state: AppStore) => state.user.details);
  const userFeatures = details?.features ?? [];
  const subscriptionFeatures = details?.subscription?.plan?.features ?? [];

  return Object.values(USER_FEATURES).reduce(
    (acc, feature) => {
      acc[feature] = userFeatures.includes(feature) || subscriptionFeatures.includes(feature);

      return acc;
    },
    {} as Record<UserFeatures, boolean>
  );
};
