import {useQuery, queryOptions} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import {TaskPermission} from '../tasks/types';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

type User = {
  user_id: number;
  org_id: number | null;
  superUser: boolean;
  features: Features;
};

type Features = {
  iotAccess: boolean;
  boreholeAccess: boolean;
  tasks: TaskPermission;
  contacts: boolean;
  keys: boolean;
  ressources: boolean;
  routesAndParking: boolean;
  alarms: boolean;
  stationProgress: boolean;
};

const defaultUser: UserAccessControl = {
  user_id: -1,
  org_id: null,
  superUser: false,
  features: {
    iotAccess: false,
    boreholeAccess: false,
    tasks: TaskPermission.none,
    contacts: false,
    keys: false,
    ressources: false,
    routesAndParking: false,
    alarms: false,
    stationProgress: false,
  },
  advancedTaskPermission: false,
  simpleTaskPermission: false,
};

export const userQueryOptions = queryOptions({
  queryKey: queryKeys.user(),
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
  useNavigationFunctions();

  if (!data) return defaultUser;

  return {
    ...data,
    advancedTaskPermission: data?.features?.tasks === TaskPermission.advanced,
    simpleTaskPermission:
      data?.features?.tasks === TaskPermission.simple ||
      data?.features?.tasks === TaskPermission.advanced,
  } as UserAccessControl;
};

type UserAccessControl = User & {
  superUser: boolean;
  advancedTaskPermission: boolean;
  simpleTaskPermission: boolean;
};
