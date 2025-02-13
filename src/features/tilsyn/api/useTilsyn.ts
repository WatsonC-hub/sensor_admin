import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {GetQueryOptions} from '~/queryClient';
import {useAppContext} from '~/state/contexts';
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

export const tilsynGetOptions = <TData>(ts_id: number | undefined): GetQueryOptions<TData> => ({
  queryKey: ['service', ts_id],
  queryFn: async () => {
    // try {
    const {data} = await apiClient.get<TData>(`/sensor_field/station/service/${ts_id}`);
    return data;
    // return data.map((m) => {
    //   return {
    //     ...m,
    //   //     dato: moment(m.dato).format('YYYY-MM-DDTHH:mm'),
    //   //   };
    //   // });
    // } catch (error) {
    //   console.log((error as AxiosError).response?.data.detail);
    //   return null;
    // }
  },
  enabled: ts_id !== undefined && ts_id !== null,
});

export const useTilsyn = () => {
  const queryClient = useQueryClient();

  const {ts_id} = useAppContext(['ts_id']);
  const get = useQuery(tilsynGetOptions<Array<TilsynItem>>(ts_id));

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
