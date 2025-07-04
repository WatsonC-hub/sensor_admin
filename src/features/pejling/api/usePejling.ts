import {useQuery, useMutation, useQueryClient, queryOptions} from '@tanstack/react-query';
import dayjs from 'dayjs';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {invalidateFromMeta} from '~/helpers/InvalidationHelper';
import {PejlingInvalidation, queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {APIError} from '~/queryClient';
import {useAppContext} from '~/state/contexts';
import {PejlingItem} from '~/types';

interface PejlingBase {
  path: string;
  data?: any;
}

interface PejlingPost extends PejlingBase {
  data: {
    comment?: string;
    measurement: number | null;
    timeofmeas: dayjs.Dayjs;
    useforcorrection: number;
    extrema?: string | null;
    pumpstop?: string | null;
    service?: boolean | null;
  };
}

type PejlingPut = PejlingPost;

const pejlingPostOptions = {
  mutationKey: ['pejling_post'],
  mutationFn: async (mutation_data: PejlingPost) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.post(`/sensor_field/station/measurements/${path}`, data);
    return result;
  },
};

const pejlingPutOptions = {
  mutationKey: ['pejling_put'],
  mutationFn: async (mutation_data: PejlingPut) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.put(`/sensor_field/station/measurements/${path}`, data);
    return result;
  },
};

const pejlingDelOptions = {
  mutationKey: ['pejling_del'],
  mutationFn: async (mutation_data: PejlingBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/sensor_field/station/measurements/${path}`);
    return result;
  },
};

export const pejlingGetOptions = (ts_id: number | undefined) =>
  queryOptions<Array<PejlingItem>, APIError>({
    queryKey: [queryKeys.Pejling.all(ts_id!)],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<PejlingItem>>(
        `/sensor_field/station/measurements/${ts_id}`
      );

      return data;
    },
    enabled: ts_id !== 0 && ts_id !== null && ts_id !== undefined,
  });

const onMutatePejling = async (ts_id: number, loc_id: number) => {
  return {
    meta: {
      invalidates: PejlingInvalidation(ts_id, loc_id),
    },
  };
};

export const usePejling = () => {
  const queryClient = useQueryClient();
  const {ts_id, loc_id} = useAppContext(['ts_id', 'loc_id']);

  const get = useQuery(pejlingGetOptions(ts_id));

  const post = useMutation({
    ...pejlingPostOptions,
    onMutate: async () => onMutatePejling(ts_id, loc_id),
    onSuccess: (data, variables, context) => {
      invalidateFromMeta(queryClient, context.meta);
      toast.success('Pejling gemt');
    },
  });

  const put = useMutation({
    ...pejlingPutOptions,
    onMutate: async () => onMutatePejling(ts_id, loc_id),
    onSuccess: (data, variables, context) => {
      invalidateFromMeta(queryClient, context.meta);
      toast.success('Pejling ændret');
    },
  });

  const del = useMutation({
    ...pejlingDelOptions,
    onMutate: async () => onMutatePejling(ts_id, loc_id),
    onSuccess: (data, variables, context) => {
      invalidateFromMeta(queryClient, context.meta);
      toast.success('Pejling slettet');
    },
  });

  return {get, post, put, del};
};
