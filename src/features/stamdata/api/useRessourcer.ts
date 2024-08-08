import {useQuery, useMutation} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {Ressourcer} from '~/features/stamdata/components/multiselect/types';

interface RessourcerBase {
  path: string;
  data?: any;
}

interface RessourcerPost extends RessourcerBase {
  data: {
    navn: string;
    kategori: string;
    ts_type_id?: Array<number>;
    loc_type_id?: Array<number>;
    forudvalgt: boolean;
  };
}

interface RessourcerPut extends RessourcerBase {
  data: {
    navn: string;
    kategori: string;
    ts_type_id?: Array<number>;
    loc_type_id?: Array<number>;
    forudvalgt: boolean;
  };
}

export const ressourcerPostOptions = {
  mutationKey: ['ressourcer_post'],
  mutationFn: async (mutation_data: RessourcerPost) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.post(`/sensor_field/stamdata/ressourcer/${path}`, data);
    return result;
  },
};

export const ressourcerPutOptions = {
  mutationKey: ['ressourcer_put'],
  mutationFn: async (mutation_data: RessourcerPut) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.put(`/sensor_field/stamdata/ressourcer/${path}`, data);
    return result;
  },
};

export const ressourcerDelOptions = {
  mutationKey: ['ressourcer_del'],
  mutationFn: async (mutation_data: RessourcerBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/sensor_field/stamdata/ressourcer/${path}`);
    return result;
  },
};

export const useRessourcer = () => {
  const get = useQuery({
    queryKey: ['ressourcer'],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Ressourcer>>(`/sensor_field/stamdata/ressourcer`);

      return data;
    },
  });

  const post = useMutation({
    ...ressourcerPostOptions,
    onSuccess: () => {
      get.refetch();
      toast.success('Ressourcer gemt');
    },
  });

  const put = useMutation({
    ...ressourcerPutOptions,
    onSuccess: () => {
      get.refetch();
      toast.success('Ressourcer ændret');
    },
  });

  const del = useMutation({
    ...ressourcerDelOptions,
    onSuccess: () => {
      toast.success('Ressourcer slettet');
      get.refetch();
    },
  });

  return {get, post, put, del};
};
