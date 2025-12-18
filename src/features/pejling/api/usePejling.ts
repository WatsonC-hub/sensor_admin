import {useQuery, useMutation, queryOptions} from '@tanstack/react-query';
import {Dayjs} from 'dayjs';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {APIError, queryClient} from '~/queryClient';
import {useAppContext} from '~/state/contexts';
import {PejlingItem} from '~/types';

interface PejlingBase {
  path: string;
  data?: any;
}

interface PejlingPost extends PejlingBase {
  data: {
    comment?: string | null;
    measurement: number | null;
    timeofmeas: Dayjs;
    useforcorrection: number;
    extrema?: string | null;
    pumpstop?: Dayjs | null;
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
    queryKey: queryKeys.Timeseries.pejling(ts_id!),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<PejlingItem>>(
        `/sensor_field/station/measurements/${ts_id}`
      );

      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: ts_id !== 0 && ts_id !== null && ts_id !== undefined,
    meta: {
      invalidates: ['kontrol'],
    },
  });

export const usePejling = () => {
  const {ts_id} = useAppContext(['ts_id']);

  const get = useQuery(pejlingGetOptions(ts_id));

  const post = useMutation({
    ...pejlingPostOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.Timeseries.pejling(ts_id!),
      });
      toast.success('Pejling gemt');
    },
    meta: {
      invalidates: [['kontrol']],
    },
  });

  const put = useMutation({
    ...pejlingPutOptions,
    onSuccess: () => {
      toast.success('Pejling ændret');
    },
    meta: {
      invalidates: [['kontrol']],
    },
  });

  const del = useMutation({
    ...pejlingDelOptions,
    onSuccess: () => {
      toast.success('Pejling slettet');
    },
    meta: {
      invalidates: [['kontrol']],
    },
  });

  return {get, post, put, del};
};
