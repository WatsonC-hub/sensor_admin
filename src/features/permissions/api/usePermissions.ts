import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';

export type LocationPermissions = Record<number, 'read' | 'edit'>;

export type BoreholePermissions = {
  boreholenos: Array<string>;
  plantids: Array<string>;
};

export type GlobalPermissions = {
  borehole_plantids: BoreholePermissions;
};

export const useGlobalPermissionsQueryOptions = () => {
  return queryOptions({
    queryKey: ['borehole_permissions'],
    queryFn: async () => {
      const {data} = await apiClient.get<GlobalPermissions>(`/auth/me/permissions`);
      return data;
    },
  });
};

export const usePermissionsQueryOptions = (loc_id?: number) => {
  return queryOptions({
    queryKey: ['permissions', loc_id],
    queryFn: async () => {
      const {data} = await apiClient.get<LocationPermissions>(
        `/auth/me/location_permissions/${loc_id}`
      );
      return data;
    },
    enabled: loc_id !== undefined,
  });
};

const usePermissions = (loc_id?: number) => {
  const borehole_permission_query = useQuery(useGlobalPermissionsQueryOptions());

  const feature_permission_query = useQuery(usePermissionsQueryOptions(loc_id));

  return {borehole_permission_query, feature_permission_query};
};

export default usePermissions;
