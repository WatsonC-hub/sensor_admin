import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';

type LocationPermissions = Record<number, 'read' | 'edit'>;

type BoreholePermissions = {
  boreholenos: Array<string>;
  plantids: Array<string>;
};

type GlobalPermissions = {
  borehole_plantids: BoreholePermissions;
};

const useGlobalPermissionsQueryOptions = () => {
  return queryOptions({
    queryKey: queryKeys.BoreholePermissions.all(),
    queryFn: async () => {
      const {data} = await apiClient.get<GlobalPermissions>(`/auth/me/permissions`);
      return data;
    },
    staleTime: 1000 * 60 * 1,
  });
};

const usePermissionsQueryOptions = (loc_id?: number) => {
  return queryOptions({
    queryKey: queryKeys.Location.permissions(loc_id),
    queryFn: async () => {
      const {data} = await apiClient.get<LocationPermissions>(
        `/auth/me/location_permissions/${loc_id}`
      );
      return data;
    },
    enabled: loc_id !== undefined && loc_id !== -1,
    staleTime: 1000 * 60 * 1,
  });
};

const usePermissions = (loc_id?: number) => {
  const borehole_permission_query = useQuery(useGlobalPermissionsQueryOptions());

  const feature_permission_query = useQuery(usePermissionsQueryOptions(loc_id));

  const {data} = feature_permission_query;

  const ts_permissions = data && Object.values(data);

  let location_permissions: 'read' | 'edit';

  if (ts_permissions) {
    if (ts_permissions.length == 0) {
      location_permissions = 'edit';
    }
    location_permissions =
      ts_permissions.some((v) => v === 'edit') || ts_permissions.length === 0 ? 'edit' : 'read';
  } else {
    location_permissions = 'edit';
  }

  return {
    borehole_permission_query,
    feature_permission_query,
    location_permissions: location_permissions,
  };
};

export default usePermissions;
