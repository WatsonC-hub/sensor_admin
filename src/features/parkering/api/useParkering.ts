import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {Parking} from '~/types';

interface ParkeringBase {
  path: string;
  data?: any;
}

export interface ParkeringPost extends ParkeringBase {
  data: {
    x: number;
    y: number;
    loc_id?: number;
  };
}

interface ParkeringPut extends ParkeringBase {
  data: {
    loc_id: number;
  };
}

export const parkeringPostOptions = {
  mutationKey: ['parkering_post'],
  mutationFn: async (mutation_data: ParkeringPost) => {
    const {data} = mutation_data;
    const {data: result} = await apiClient.post(`/sensor_field/stamdata/parking`, data);
    return result;
  },
};

export const parkeringPutOptions = {
  mutationKey: ['parkering_put'],
  mutationFn: async (mutation_data: ParkeringPut) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.put(`/sensor_field/stamdata/parking/${path}`, data);
    return result;
  },
};

export const parkeringDelOptions = {
  mutationKey: ['parkering_del'],
  mutationFn: async (mutation_data: ParkeringBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/sensor_field/stamdata/parking/${path}`);
    return result;
  },
};

export const useParkering = () => {
  const queryClient = useQueryClient();

  const get = useQuery({
    queryKey: ['parking'],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Parking>>(`/sensor_field/stamdata/parking`);

      return data;
    },
  });

  const post = useMutation({
    ...parkeringPostOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['parking'],
      });
      toast.success('Parkering gemt');
    },
  });

  const put = useMutation({
    ...parkeringPutOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['parking'],
      });
      toast.success('Parkering ændret');
    },
  });

  const del = useMutation({
    ...parkeringDelOptions,
    onSuccess: () => {
      toast.success('Parkering slettet');
      queryClient.invalidateQueries({
        queryKey: ['parking'],
      });
    },
  });

  return {get, post, put, del};
};
