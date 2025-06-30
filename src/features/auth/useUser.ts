import {useQuery, queryOptions} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import {TaskPermission} from '../tasks/types';

type User = {
  user_id: number;
  org_id: number | null;
  superUser: boolean;
  features: Features;
};

export type Features = {
  iotAccess: boolean;
  boreholeAccess: boolean;
  tasks: TaskPermission;
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
        advancedTaskPermission: data?.features?.tasks === TaskPermission.advanced,
        simpleTaskPermission:
          data?.features?.tasks === TaskPermission.simple ||
          data?.features?.tasks === TaskPermission.advanced,
      } as UserAccessControl)
    : null;
};

export type UserAccessControl = User & {
  superUser: boolean;
  advancedTaskPermission: boolean;
  simpleTaskPermission: boolean;
};
