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

export type Features = {
  iotAccess: boolean;
  boreholeAccess: boolean;
  tasks: 'simple' | 'advanced' | 'none';
  contacts: boolean;
  keys: boolean;
  resources: boolean;
  routesAndParking: boolean;
};

type AccessControl = {
  role: string;
  features: Features;
  attributes: {
    [key: string]: string | number | boolean;
  };
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

export const accessControlQueryOptions = queryOptions({
  queryKey: ['accessControl'],
  queryFn: async () => {
    const {data} = await apiClient.get<AccessControl>(`/auth/access-control`);
    return data;
  },
  refetchOnWindowFocus: false,
  refetchInterval: Infinity,
  refetchOnMount: false,
  refetchOnReconnect: false,
});

export type AccessControlReturnType = AccessControl & {
  superUser: boolean;
  advancedTaskPermission: boolean;
  simpleTaskPermission: boolean;
};

export const useAccessControl = () => {
  const {data} = useQuery(accessControlQueryOptions);

  const out: AccessControlReturnType = {
    ...(data as AccessControl),
    superUser: data?.role === 'superuser',
    advancedTaskPermission: false, //data?.features.tasks === 'advanced',
    simpleTaskPermission: false, //data?.features.tasks === 'simple' || data?.features.tasks === 'advanced',
  };

  return out;
};
