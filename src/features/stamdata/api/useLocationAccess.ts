import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {GetQueryOptions} from '~/queryClient';
import {Access, AccessTable} from '~/types';

interface LocationAccessBase {
  path: string;
}

interface LocationAccessPost extends LocationAccessBase {
  data: Access;
}

interface LocationAccessPut extends LocationAccessBase {
  data: Access;
}

export const locationAccessPostOptions = {
  mutationKey: ['location_access_post'],
  mutationFn: async (mutation_data: LocationAccessPost) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.post(
      `/sensor_field/stamdata/location_access/${path}`,
      data
    );
    return result;
  },
};

export const locationAccessPutOptions = {
  mutationKey: ['location_access_put'],
  mutationFn: async (mutation_data: LocationAccessPut) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.put(
      `/sensor_field/stamdata/location_access/${path}`,
      data
    );
    return result;
  },
};

export const locationAccessDelOptions = {
  mutationKey: ['location_access_del'],
  mutationFn: async (mutation_data: LocationAccessBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/sensor_field/stamdata/location_access/${path}`);
    return result;
  },
};

export const LocationAccessGetOptions = <TData>(
  loc_id: number | undefined
): GetQueryOptions<TData> => ({
  queryKey: ['location_access', loc_id],
  queryFn: async () => {
    const {data} = await apiClient.get<TData>(`/sensor_field/stamdata/location_access/${loc_id}`);

    return data;
  },
  enabled: loc_id !== undefined && loc_id !== null,
});

export const useSearchLocationAccess = (loc_id: number | undefined, searchString: string) => {
  const searched_location_access = useQuery({
    queryKey: ['search_location_access', searchString],
    queryFn: async () => {
      let data;
      if (searchString.trim() === '') {
        const response = await apiClient.get<Array<Access>>(
          `/sensor_field/stamdata/location_access/relevant_location_access/${loc_id}`
        );
        data = response.data;
      } else {
        const response = await apiClient.get<Array<Access>>(
          `/sensor_field/stamdata/location_access/search_location_access/${loc_id}/${searchString}`
        );
        data = response.data;
      }
      return data;
    },
    staleTime: 10 * 1000,
  });
  return searched_location_access;
};

export const useLocationAccess = (loc_id: number | undefined) => {
  const queryClient = useQueryClient();
  const get = useQuery(LocationAccessGetOptions<Array<AccessTable>>(loc_id));

  const post = useMutation({
    ...locationAccessPostOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['location_access', loc_id],
      });

      toast.success('Adgangsinformation gemt');
    },
  });

  const put = useMutation({
    ...locationAccessPutOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['location_access', loc_id],
      });

      toast.success('Adgangsinformation ændret');
    },
  });

  const del = useMutation({
    ...locationAccessDelOptions,
    onSuccess: () => {
      toast.success('Adgangsinformation slettet');
      queryClient.invalidateQueries({
        queryKey: ['location_access', loc_id],
      });
    },
  });

  return {get, post, put, del};
};
