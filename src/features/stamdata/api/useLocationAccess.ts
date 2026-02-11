import {useQuery, useMutation, queryOptions} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {APIError} from '~/queryClient';
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

const locationAccessPostOptions = {
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

const locationAccessPutOptions = {
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

const locationAccessDelOptions = {
  mutationKey: ['location_access_del'],
  mutationFn: async (mutation_data: LocationAccessBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/sensor_field/stamdata/location_access/${path}`);
    return result;
  },
};

export const locationAccessGetOptions = (loc_id: number) =>
  queryOptions<Array<AccessTable>, APIError>({
    queryKey: queryKeys.Location.keys(loc_id),
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/stamdata/location_access/${loc_id}`);

      return data;
    },
  });

export const useSearchLocationAccess = (loc_id: number, searchString: string) => {
  const searched_location_access = useQuery({
    queryKey: queryKeys.Location.searchKeys(searchString),
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
    enabled: loc_id !== undefined,
  });
  return searched_location_access;
};

export const useLocationAccess = (loc_id: number) => {
  const get = useQuery(locationAccessGetOptions(loc_id));

  const post = useMutation({
    ...locationAccessPostOptions,
    onSuccess: () => {
      toast.success('Adgangsinformation gemt');
    },
    meta: {
      invalidates: [queryKeys.Location.keys(loc_id), [queryKeys.Location.info(loc_id)]],
      optOutGeneralInvalidations: true,
    },
  });

  const put = useMutation({
    ...locationAccessPutOptions,
    onSuccess: () => {
      toast.success('Adgangsinformation ændret');
    },
    meta: {
      invalidates: [queryKeys.Location.keys(loc_id), [queryKeys.Location.info(loc_id)]],
      optOutGeneralInvalidations: true,
    },
  });

  const del = useMutation({
    ...locationAccessDelOptions,
    onSuccess: () => {
      toast.success('Adgangsinformation slettet');
    },
    meta: {
      invalidates: [queryKeys.Location.keys(loc_id), [queryKeys.Location.info(loc_id)]],
      optOutGeneralInvalidations: true,
    },
  });

  return {get, post, put, del};
};
