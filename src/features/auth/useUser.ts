import {useQuery, queryOptions} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';

type OldUser = {
  user_id: number;
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

type User = {
  user_id: number;
  org_id: number | null;
  superUser: boolean;
  features: Features;
};

export type Features = {
  iotAccess: boolean;
  boreholeAccess: boolean;
  // tasks: TaskPermission;
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

  const output: OldUser = {
    user_id: data?.user_id ?? 0,
    org_id: data?.org_id ?? null,
    boreholeAccess: data?.features?.boreholeAccess ?? false,
    iotAccess: data?.features?.iotAccess ?? false,
    adminAccess: data?.superUser ?? false,
    superUser: data?.superUser ?? false,
    advancedTaskPermission: false,
    simpleTaskPermission: false, // Assuming this is the same as advanced for now
    QAPermission: true, // Assuming this is the same as ressources for now
    contactAndKeysPermission: data?.features?.contacts || data?.features?.keys || false,
    ressourcePermission: data?.features?.ressources || false,
  };

  return (data == null ? null : output) as OldUser;
};
