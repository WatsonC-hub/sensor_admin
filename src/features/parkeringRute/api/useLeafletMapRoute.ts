import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {LeafletMapRoute} from '~/types';

interface LeafletMapRouteBase {
  path: string;
  data?: any;
}

interface LeafletMapRoutePost extends LeafletMapRouteBase {
  data: {
    geo_route: GeoJSON.Geometry;
  };
}

interface LeafletMapRoutePut extends LeafletMapRouteBase {
  data: {
    geo_route: GeoJSON.Geometry;
  };
}

const leafletMapRoutePostOptions = {
  mutationKey: ['leaflet_map_route_post'],
  mutationFn: async (mutation_data: LeafletMapRoutePost) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.post(`/sensor_field/leaflet_map_route/${path}`, data);
    return result;
  },
};

const leafletMapRoutePutOptions = {
  mutationKey: ['leaflet_map_route_put'],
  mutationFn: async (mutation_data: LeafletMapRoutePut) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.put(`/sensor_field/leaflet_map_route/${path}`, data);
    return result;
  },
};

const leafletMapRouteDelOptions = {
  mutationKey: ['leaflet_map_route_del'],
  mutationFn: async (mutation_data: LeafletMapRouteBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/sensor_field/leaflet_map_route/${path}`);
    return result;
  },
};

export const useLeafletMapRoute = () => {
  const queryClient = useQueryClient();
  const get = useQuery({
    queryKey: queryKeys.Routes.all(),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<LeafletMapRoute>>(`/sensor_field/leaflet_map_route`);

      return data;
    },
    staleTime: 10 * 1000,
  });

  const post = useMutation({
    ...leafletMapRoutePostOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.Routes.all(),
      });
      toast.success('Rute gemt');
    },
  });

  const put = useMutation({
    ...leafletMapRoutePutOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.Routes.all(),
      });
      toast.success('Rute ændret');
    },
  });

  const del = useMutation({
    ...leafletMapRouteDelOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.Routes.all(),
      });
      toast.success('Rute slettet');
    },
  });

  return {get, post, put, del};
};
