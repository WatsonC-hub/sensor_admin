import {useQuery, queryOptions} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';

type User = {
  user_id: number;
  org_id: number | null;
  superUser: boolean;
  features: Features;
};

export type Features = {
  iotAccess: boolean;
  boreholeAccess: boolean;
  contacts: boolean;
  keys: boolean;
  ressources: boolean;
  routesAndParking: boolean;
};

export const userQueryOptions = queryOptions({
  queryKey: ['user'],
  queryFn: async () => {
    const {data} = await apiClient.get<User>(`/auth/me/secure`);
    return data;
  },
  refetchOnWindowFocus: false,
  refetchInterval: Infinity,
  refetchOnMount: false,
  refetchOnReconnect: false,
});

export const useUser = () => {
  const {data} = useQuery(userQueryOptions);

  return data
    ? ({
        ...data,
      } as UserAccessControl)
    : null;
};

export type UserAccessControl = User & {
  superUser: boolean;
  advancedTaskPermission: boolean;
  simpleTaskPermission: boolean;
};
