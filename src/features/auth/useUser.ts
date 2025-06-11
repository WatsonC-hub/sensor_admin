import {useQuery, queryOptions} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';

type User = {
  user_id: number | null;
  org_id: number | null;
  boreholeAccess: boolean;
  iotAccess: boolean;
  adminAccess: boolean;
  superUser: boolean;
  advancedTaskPermission: boolean;
  simpleTaskPermission: boolean;
  QAPermission: boolean;
  contactAndKeysPermission: boolean;
  ressourcePermission: boolean;
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

  return data as User;
};
