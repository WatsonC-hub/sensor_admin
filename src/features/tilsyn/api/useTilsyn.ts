import {useQuery, useMutation, useQueryClient, queryOptions} from '@tanstack/react-query';
import {Dayjs} from 'dayjs';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {invalidateFromMeta} from '~/helpers/InvalidationHelper';
import {queryKeys, TilsynInvalidation} from '~/helpers/QueryKeyFactoryHelper';
import {APIError} from '~/queryClient';
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
    dato: Dayjs;
    gid: number;
    kommentar?: string;
  };
}

interface TilsynPut extends TilsynPost {
  data: {
    batteriskift: boolean;
    tilsyn: boolean;
    dato: Dayjs;
    gid: number;
    kommentar?: string;
  };
}

const tilsynPostOptions = {
  mutationKey: ['tilsyn_post'],
  mutationFn: async (mutation_data: TilsynPost) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.post(`/sensor_field/station/service/${path}`, data);
    return result;
  },
};

const tilsynPutOptions = {
  mutationKey: ['tilsyn_put'],
  mutationFn: async (mutation_data: TilsynPut) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.put(`/sensor_field/station/service/${path}`, data);
    return result;
  },
};

const tilsynDelOptions = {
  mutationKey: ['tilsyn_del'],
  mutationFn: async (mutation_data: TilsynBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/sensor_field/station/service/${path}`);
    return result;
  },
};

export const tilsynGetOptions = (ts_id: number | undefined) =>
  queryOptions<Array<TilsynItem>, APIError>({
    queryKey: queryKeys.Timeseries.tilsyn(ts_id!),
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/station/service/${ts_id}`);
      return data;
    },
    enabled: ts_id !== undefined && ts_id !== null,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

const onMutateTilsyn = async (ts_id: number, loc_id: number) => {
  return {
    meta: {
      invalidates: TilsynInvalidation(ts_id, loc_id),
    },
  };
};

export const useTilsyn = () => {
  const queryClient = useQueryClient();

  const {ts_id, loc_id} = useAppContext(['ts_id', 'loc_id']);
  const get = useQuery(tilsynGetOptions(ts_id));

  const post = useMutation({
    ...tilsynPostOptions,
    onMutate: async () => onMutateTilsyn(ts_id, loc_id),
    onSuccess: (data, variables, context) => {
      invalidateFromMeta(queryClient, context.meta);
      toast.success('Tilsyn gemt');
    },
  });

  const put = useMutation({
    ...tilsynPutOptions,
    onMutate: async () => onMutateTilsyn(ts_id, loc_id),
    onSuccess: (data, variables, context) => {
      invalidateFromMeta(queryClient, context.meta);
      toast.success('Tilsyn ændret');
    },
  });

  const del = useMutation({
    ...tilsynDelOptions,
    onMutate: async () => onMutateTilsyn(ts_id, loc_id),
    onSuccess: (data, variables, context) => {
      invalidateFromMeta(queryClient, context.meta);
      toast.success('Tilsyn slettet');
    },
  });

  return {get, post, put, del};
};
