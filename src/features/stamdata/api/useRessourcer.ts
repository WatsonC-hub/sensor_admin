import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {Ressourcer} from '~/features/stamdata/components/stationDetails/multiselect/types';

interface RessourcerBase {
  path: string;
  data?: any;
}

interface RessourcerPost extends RessourcerBase {
  data: {
    ressourcer: Array<Ressourcer>;
  };
}

interface RessourcerPut extends RessourcerBase {
  data: {
    ressourcer: Array<Ressourcer>;
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

export const useRessourcer = (loc_id: number | undefined) => {
  const queryClient = useQueryClient();
  const get = useQuery({
    queryKey: ['ressourcer'],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Ressourcer>>(`/sensor_field/stamdata/ressourcer`);

      return data;
    },
  });

  const relation = useQuery({
    queryKey: ['ressourcer', loc_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Ressourcer>>(
        `/sensor_field/stamdata/ressourcer/${loc_id}`
      );

      return data;
    },
  });

  const post = useMutation({
    ...ressourcerPostOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['ressourcer'],
      });
      queryClient.invalidateQueries({
        queryKey: ['ressourcer', loc_id],
      });
      toast.success('Ressourcer gemt');
    },
  });

  const put = useMutation({
    ...ressourcerPutOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['ressourcer'],
      });
      queryClient.invalidateQueries({
        queryKey: ['ressourcer', loc_id],
      });
      toast.success('Ressourcer ændret');
    },
  });

  const del = useMutation({
    ...ressourcerDelOptions,
    onSuccess: () => {
      toast.success('Ressourcer slettet');
      queryClient.invalidateQueries({
        queryKey: ['ressourcer'],
      });
      queryClient.invalidateQueries({
        queryKey: ['ressourcer', loc_id],
      });
    },
  });

  return {get, relation, post, put, del};
};
