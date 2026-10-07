import {queryOptions, useQuery} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/queryKeyFactoryHelper';

import {TaskPermission} from '../tasks/types';

// The ids are strings: they have 15 or 16 digits, which a JavaScript number cannot hold exactly
type User = {
  user_id: string;
  org_id: string | null;
  email: string;
  superUser: boolean;
  attributes: Attributes;
  features: Features;
};

type Attributes = {
  has_own_service: boolean;
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
  user_id: '',
  org_id: null,
  email: '',
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
  attributes: {
    has_own_service: false,
  },
  advancedTaskPermission: false,
  simpleTaskPermission: false,
};

// Whether two ids are the same. The user's ids are exact strings, but some APIs still send ids as JSON
// numbers, which a JavaScript number only holds exactly up to 2^53 (a few of the 16-digit ids are above).
// Comparing both as numbers rounds both alike, so they still match; comparing the string with
// String(number) would not.
export const sameId = (
  id: string | number | null | undefined,
  other: string | number | null | undefined
) => id != null && other != null && Number(id) === Number(other);

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
