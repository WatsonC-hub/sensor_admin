import {useQuery, useMutation} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {Parking} from '~/types';

interface ParkeringBase {
  path: string;
  data?: any;
}

interface ParkeringPost extends ParkeringBase {
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

const parkeringPostOptions = {
  mutationKey: ['parkering_post'],
  mutationFn: async (mutation_data: ParkeringPost) => {
    const {data} = mutation_data;
    const {data: result} = await apiClient.post(`/sensor_field/stamdata/parking`, data);
    return result;
  },
};

const parkeringPutOptions = {
  mutationKey: ['parkering_put'],
  mutationFn: async (mutation_data: ParkeringPut) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.put(`/sensor_field/stamdata/parking/${path}`, data);
    return result;
  },
};

const parkeringDelOptions = {
  mutationKey: ['parkering_del'],
  mutationFn: async (mutation_data: ParkeringBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/sensor_field/stamdata/parking/${path}`);
    return result;
  },
};

export const useParkering = () => {
  const get = useQuery({
    queryKey: queryKeys.Parking.all(),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Parking>>(`/sensor_field/stamdata/parking`);

      return data;
    },
    staleTime: 10 * 1000,
  });

  const post = useMutation({
    ...parkeringPostOptions,
    onSuccess: () => {
      toast.success('Parkering gemt');
    },
    meta: {invalidates: [queryKeys.Parking.all()], optOutGeneralInvalidations: true},
  });

  const put = useMutation({
    ...parkeringPutOptions,
    onSuccess: () => {
      toast.success('Parkering ændret');
    },
    meta: {invalidates: [queryKeys.Parking.all()], optOutGeneralInvalidations: true},
  });

  const del = useMutation({
    ...parkeringDelOptions,
    onSuccess: () => {
      toast.success('Parkering slettet');
    },
    meta: {invalidates: [queryKeys.Parking.all()], optOutGeneralInvalidations: true},
  });

  return {get, post, put, del};
};
