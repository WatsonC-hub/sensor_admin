import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {stamdataStore} from '~/state/store';
import {TilsynItem} from '~/types';

interface TilsynBase {
  path: string;
  data?: any;
}

interface TilsynPost extends TilsynBase {
  data: {
    batteriskift: boolean;
    tilsyn: boolean;
    dato: string;
    gid: number;
    kommentar?: string;
    user_id: string | null;
  };
}

interface TilsynPut extends TilsynPost {
  data: {
    batteriskift: boolean;
    tilsyn: boolean;
    dato: string;
    gid: number;
    kommentar?: string;
    user_id: string | null;
  };
}

export const tilsynPostOptions = {
  mutationKey: ['tilsyn_post'],
  mutationFn: async (mutation_data: TilsynPost) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.post(`/sensor_field/station/service/${path}`, data);
    return result;
  },
};

export const tilsynPutOptions = {
  mutationKey: ['tilsyn_put'],
  mutationFn: async (mutation_data: TilsynPut) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.put(`/sensor_field/station/service/${path}`, data);
    return result;
  },
};

export const tilsynDelOptions = {
  mutationKey: ['tilsyn_del'],
  mutationFn: async (mutation_data: TilsynBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/sensor_field/station/service/${path}`);
    return result;
  },
};

export const useTilsyn = () => {
  const queryClient = useQueryClient();

  const ts_id = stamdataStore((store) => store.timeseries.ts_id);
  const get = useQuery({
    queryKey: ['service', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<TilsynItem>>(
        `/sensor_field/station/service/${ts_id}`
      );

      return data.map((m) => {
        return {
          ...m,
          dato: moment(m.dato).format('YYYY-MM-DDTHH:mm'),
        };
      });
    },
    enabled: ts_id !== undefined && ts_id !== 0 && ts_id !== null,
  });

  const post = useMutation({
    ...tilsynPostOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['service', ts_id],
      });
      toast.success('Tilsyn gemt');
    },
  });

  const put = useMutation({
    ...tilsynPutOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['service', ts_id],
      });
      toast.success('Tilsyn ændret');
    },
  });

  const del = useMutation({
    ...tilsynDelOptions,
    onSuccess: () => {
      toast.success('Tilsyn slettet');
      queryClient.invalidateQueries({
        queryKey: ['service', ts_id],
      });
    },
  });

  return {get, post, put, del};
};
